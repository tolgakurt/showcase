#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include "IOManager.h"
#include "ActivationFunction.h"

using namespace std;

void IOManager::read_input(const string& filename) {
    ifstream input_file(filename);

    if (input_file.is_open()) {
        string temp;

        // First line in the input file is the name of the dataset file.
        getline(input_file, this->dataset_filename);

        // Second line in the input file represents the number of features.
        getline(input_file, temp);
        this->number_of_features = stoi(temp);

        // Third line in the input file represents the number of topologies.
        getline(input_file, temp);
        this->topology_count = stoi(temp);

        // Construct topologies equal to the number of topologies.
        for (int t_index = 0; t_index < this->topology_count; t_index++) {
            // The first layer of a topology has perceptrons equal to the number
            // of features.
            vector<size_t> topology;
            topology.push_back(this->number_of_features);

            // Beginning from 4th line, topology_count number of lines represent the
            // number of perceptrons in the hidden layers.
            getline(input_file, temp);
            auto hidden_layer_p_count = stoi(temp);
            topology.push_back(hidden_layer_p_count);

            // The last layer of a topology has a single perceptron, indicating
            // the output perceptron.
            topology.push_back(1);

            topologies.push_back(topology);
        }

        // Next line represents the activation function code to be tried.
        getline(input_file, temp);
        auto act_fun_codes = this->split_line_to_unsigned(temp);
        for (const auto& act_fun_code : act_fun_codes) {
            this->act_funs.push_back(static_cast<ActivationFunction>(act_fun_code));
        }

        // Next line represents the learning rates to be tried.
        getline(input_file, temp);
        this->learning_rates = this->split_line_to_double(temp);

        // Next line represents the number of epochs, i.e., whole iterations
        // to train the network.
        getline(input_file, temp);
        this->number_of_epochs = stoi(temp);

        input_file.close();
    }
    else {
        cout << "Unable to open input file.";
        throw runtime_error("Unable to open input file.");
    }

    // If the input file exists and is valid, read the dataset file.
    this->read_dataset();
}

void IOManager::read_dataset() {
    ifstream dataset_file(this->dataset_filename);

    if (dataset_file.is_open())
    {
        // Each line in the data set file represents a set of inputs and the output
        // of these inputs.
        string temp;
        while (getline(dataset_file, temp)) {
            // The last value in a line is the expected output value.
            auto row_values = this->split_line_to_double(temp);
            this->expected_outputs.push_back({ row_values[row_values.size() - 1] });

            // After reading the output, remove it from the temporary line array ...
            row_values.pop_back();

            // ... and push the rest to input vector.
            this->input_values.push_back(row_values);
        }

        dataset_file.close();
    }
    else {
        cout << "Unable to open dataset file.";
        throw runtime_error("Unable to open dataset file.");
    }
}

vector<unsigned> IOManager::split_line_to_unsigned(const string& line) const {
    vector<unsigned> splitted;

    istringstream is(line);
    int n;
    while (is >> n) splitted.push_back(n);

    return splitted;
}

vector<double> IOManager::split_line_to_double(const string& line) const {
    vector<double> splitted;

    istringstream is(line);
    double n;
    while (is >> n) splitted.push_back(n);

    return splitted;
}
