// Engine.cpp : Defines the entry point for the console application.

#include <stdio.h>
#include <tchar.h>
#include <string>
#include <fstream>
#include <iostream>
#include <algorithm>
#include "IOManager.h"
#include "Network.h"
#include "ActivationFunction.h"

using namespace std;

int _tmain(int argc, _TCHAR* argv[])
{
    // CHANGE THIS LINE TO CHANGE INPUTS.
    string input_filename = "iris.input";

    // Create an I/O manager and read the input file and the dataset file
    // given in the first line of the input file.
    IOManager io_manager;
    io_manager.read_input(input_filename);

    // To evaluate machine learning models on a limited data sample, k-fold cross validation
    // is implemented in the following region. For more information please refer to
    // https://machinelearningmastery.com/k-fold-cross-validation/

    // Separate the input data into 3 groups:
    // training data (60%), validation data (20%), and test data (20%)
    // Firstly, determine the data count in each set.
    auto data_count = io_manager.get_input_values().size();
    auto training_data_count = static_cast<int>(data_count * 0.6);
    auto validation_data_count = static_cast<int>(data_count * 0.2);
    auto test_data_count = static_cast<int>(data_count * 0.2);

    // Then push data indices into 4 training and testing folds.
    vector<vector<int>> training_folds(4);
    vector<vector<int>> testing_folds(4);
    for (int index = 0; index < (training_data_count + validation_data_count); index++) {
        if (index < validation_data_count) {
            testing_folds[0].push_back(index);
            training_folds[1].push_back(index);
            training_folds[2].push_back(index);
            training_folds[3].push_back(index);
        }
        else if (index >= validation_data_count && index < 2 * validation_data_count) {
            training_folds[0].push_back(index);
            testing_folds[1].push_back(index);
            training_folds[2].push_back(index);
            training_folds[3].push_back(index);
        }
        else if (index >= 2 * validation_data_count && index < 3 * validation_data_count) {
            training_folds[0].push_back(index);
            training_folds[1].push_back(index);
            testing_folds[2].push_back(index);
            training_folds[3].push_back(index);
        }
        else if (index >= 3 * validation_data_count && index < 4 * validation_data_count) {
            training_folds[0].push_back(index);
            training_folds[1].push_back(index);
            training_folds[2].push_back(index);
            testing_folds[3].push_back(index);
        }
    }

    // Lastly, put the last 20% of the data into test indices.
    vector<int> test_indices;
    for (size_t index = (training_data_count + validation_data_count); index < data_count; index++) {
        test_indices.push_back(index);
    }

    // Read each line in the dataset file and separate them as input and output values.
    auto all_inputs = io_manager.get_input_values();
    auto all_outputs = io_manager.get_expected_outputs();

    // Classify all ouput values and sort them in ascending order.
    vector<double> classes;
    for (size_t d_index = 0; d_index < all_outputs.size(); d_index++) {
        if (find(classes.begin(), classes.end(), all_outputs[d_index][0]) == classes.end()) {
            classes.push_back(all_outputs[d_index][0]);
        }
    }
    sort(classes.begin(), classes.end());

    // Generate separators.
    vector<double> separators;
    for (size_t c_index = 1; c_index < classes.size(); c_index++) {
        auto separator = (classes[c_index - 1] + classes[c_index]) / 2.0;
        separators.push_back(separator);
    }

    cout << "Process started. You can find the output in file: " << io_manager.get_output_filename() << "\n";

    // Initialize output file.
    ofstream output_file;
    output_file.open(io_manager.get_output_filename());
    output_file << "GENERAL INFORMATION\n";
    output_file << "Dataset: " << io_manager.get_dataset_filename() << "\n";
    output_file << "Dataset entry count: " << io_manager.get_input_values().size() << "\n";
    output_file << "Cross validation technique: 4-fold\n";
    output_file << "Training + validation dataset entry count: " << (training_data_count + validation_data_count) << "\n";
    output_file << "Testing dataset entry count: " << test_data_count << "\n";
    output_file << "Number of epochs: " << io_manager.get_number_of_epochs() << "\n";
    output_file << "Activation function codes: 0 -> sigmoidal, 1 -> linear, 2 -> hyperbolic tangential\n";
    output_file << "Accuracy = true_classifications / dataset_entry_count\n\n";

    // Try all options indicated in the input file and find the best set of
    // variables for this dataset. These variables are number of hidden layers and
    // number of perceptrons in them, learning rate, and activation function.
    int best_topology_index;
    ActivationFunction best_act_fun;
    double best_learning_rate;

    // Begin iterating for all combinations of variables to be optimized, and keep
    // the best accuracy obtained.
    auto best_set_accuracy = 0.0;

    // Iterate for topologies.
    for (int t_index = 0; t_index < io_manager.get_topology_count(); t_index++) {
        cout << "Topology: " << (t_index + 1) << "/" << io_manager.get_topology_count() << endl;
        auto topology = io_manager.get_topology(t_index);

        // Iterate for activation functions.
        for (size_t a_index = 0; a_index < io_manager.get_act_funs().size(); a_index++) {
            cout << "Activation function: " << (a_index + 1) << "/" << io_manager.get_act_funs().size() << endl;
            auto act_fun = io_manager.get_act_funs()[a_index];

            // Iterate for learning rates.
            for (size_t l_index = 0; l_index < io_manager.get_learning_rates().size(); l_index++) {
                cout << "Learning rate index: " << (l_index + 1) << "/" << io_manager.get_learning_rates().size() << endl;
                Perceptron::learning_rate = io_manager.get_learning_rates()[l_index];

                // Create a network for current topology and activation function.
                Network network(topology, act_fun);

                output_file << "CURRENT PARAMETERS\n";
                output_file << "Hidden layer perceptron count: " << io_manager.get_topology(t_index)[1] << "\n";
                output_file << "Activation function: " << static_cast<unsigned>(act_fun) << "\n";
                output_file << "Learning rate: " << io_manager.get_learning_rates()[l_index] << "\n";

                // Iterate each fold using the current network.
                auto parameter_set_accuracy = 0.0;
                for (int f_index = 0; f_index < 4; f_index++) {
                    cout << "Fold index: " << (f_index + 1) << "/4" << endl;

                    // Repeat the training `number_of_epoch` times for all the data in the training folds.
                    for (int e_index = 0; e_index < io_manager.get_number_of_epochs(); e_index++) {
                        auto progress = (static_cast<double>(e_index + 1) / io_manager.get_number_of_epochs());
                        cout << static_cast<int>(progress * 100.0) << " %\r";

                        // Train the network using back propagation.
                        for (int d_index = 0; d_index < validation_data_count; d_index++) {
                            network.feed_forward(all_inputs[training_folds[f_index][d_index]]);
                            network.back_propagate(all_outputs[training_folds[f_index][d_index]]);
                        }
                    }

                    // Now that the current network is trained, calculate the outputs
                    // and compare them with expected outputs to get an accuracy measure.
                    auto true_classifications = 0;
                    for (int d_index = 0; d_index < validation_data_count; d_index++) {
                        // Feed the network with the data in the testing fold.
                        network.feed_forward(all_inputs[testing_folds[f_index][d_index]]);

                        // Get the calculated and expected outputs.
                        auto calculated_output = network.get_results()[0];
                        auto expected_output = all_outputs[testing_folds[f_index][d_index]][0];

                        // Count the number of true classifications.
                        auto calculated_class = -1.0;
                        for (size_t s_index = 0; s_index < separators.size(); s_index++) {
                            if (calculated_output < separators[s_index]) {
                                calculated_class = classes[s_index];
                                s_index = separators.size();
                            }
                        }
                        if (calculated_class == -1.0) {
                            calculated_class = classes[separators.size()];
                        }

                        if (calculated_class == expected_output) {
                            true_classifications++;
                        }
                    }

                    // Calculate the accuracy of the classifications.
                    auto accuracy = static_cast<double>(true_classifications) / static_cast<double>(validation_data_count);
                    output_file << "Fold index: " << f_index
                        << " ->  Accuracy = " << true_classifications << "/" << validation_data_count
                        << " = " << accuracy << "" << "\n";

                    // We have 4 folds, so weight the accuracy with 0.25 and sum it up.
                    parameter_set_accuracy += accuracy * 0.25;
                }
                output_file << "Parameter set average accuracy: " << parameter_set_accuracy << "\n\n";

                // Update the parameter values if we have a better accuracy in the last iteration.
                if (parameter_set_accuracy > best_set_accuracy) {
                    best_topology_index = t_index;
                    best_act_fun = act_fun;
                    best_learning_rate = io_manager.get_learning_rates()[l_index];

                    best_set_accuracy = parameter_set_accuracy;
                }
            }
        }
    }

    output_file << "BEST PARAMETERS\n";
    output_file << "Hidden layer perceptron count: " << io_manager.get_topology(best_topology_index)[1] << "\n";
    output_file << "Activation function code: " << static_cast<unsigned>(best_act_fun) << "\n";
    output_file << "Learning rate: " << best_learning_rate << "\n\n";

    // Create a new network with the best parameters.
    auto topology = io_manager.get_topology(best_topology_index);
    Network network(topology, best_act_fun);
    Perceptron::learning_rate = best_learning_rate;

    output_file << "TEST DATA\n";
    output_file << "Training network setup with best parameters.\n";

    // Retrain the best network with 80% of the data.
    vector<int> training_indexes;
    for (size_t index = 0; index < static_cast<size_t>(training_data_count + validation_data_count); index++) {
        training_indexes.push_back(index);
    }
    for (int e_index = 0; e_index < io_manager.get_number_of_epochs(); e_index++) {
        for (int data_index = 0; data_index < (training_data_count + validation_data_count); data_index++) {
            network.feed_forward(all_inputs[training_indexes[data_index]]);
            network.back_propagate(all_outputs[training_indexes[data_index]]);
        }
    }

    // Reclassify the data with test data.
    int true_classifications = 0;
    for (int d_index = 0; d_index < test_data_count; d_index++) {
        network.feed_forward(all_inputs[test_indices[d_index]]);
        auto calculated_output = network.get_results()[0];
        auto expected_output = all_outputs[test_indices[d_index]][0];

        double calculated_class = -1.0;
        for (size_t s_index = 0; s_index < separators.size(); s_index++) {
            if (calculated_output < separators[s_index]) {
                calculated_class = classes[s_index];
                s_index = separators.size();
            }
        }
        if (calculated_class == -1.0) {
            calculated_class = classes[separators.size()];
        }

        if (calculated_class == expected_output) {
            true_classifications++;
        }
    }

    // Remeasure the accuracy of the best network.
    auto accuracy = static_cast<double>(true_classifications) / static_cast<double>(test_data_count);
    output_file << "Running test data with trained network.\n";
    output_file << "Test Data Accuracy = " << true_classifications << "/" << test_data_count << " = " << accuracy << "" << "\n";

    // Finalize the program.
    output_file.close();
    cout << "Done!";
    getchar();
    return 0;
}
