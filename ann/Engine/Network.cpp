#include "Network.h"
#include "ActivationFunction.h"

using namespace std;

Network::Network(const std::vector<size_t>& topology, ActivationFunction act_fun) {
    for (size_t l_index = 0; l_index < topology.size(); l_index++) {
        // If this is the last layer, set next layer's perceptron count to 0.
        auto next_layer_p_count = l_index == (topology.size() - 1) ? static_cast<size_t>(0) : topology[l_index + 1];
        Layer layer(topology[l_index], next_layer_p_count, act_fun);
        this->layers.push_back(layer);
    }
}

void Network::feed_forward(const vector<double>& input_values) {
    // Set each input value to the cooresponding perceptron in the input layer.
    for (size_t v_index = 0; v_index < input_values.size(); v_index++) {
        this->layers[0].get_perceptron(v_index).set_output_value(input_values[v_index]);
    }

    // Trigger each perceptron in all the layers except input layer.
    for (size_t l_index = 1; l_index < this->layers.size(); l_index++) {
        for (unsigned p_index = 0; p_index < this->layers[l_index].count_perceptrons(); p_index++) {
            this->layers[l_index].get_perceptron(p_index).feed_forward(this->layers[l_index - 1]);
        }
    }
}

void Network::back_propagate(const vector<double>& expected_results) {
    // Calculate output layer gradients.
    auto&& output_layer = this->layers.back();
    for (size_t p_index = 0; p_index < output_layer.count_perceptrons(); p_index++) {
        output_layer.get_perceptron(p_index).calc_output_gradients(expected_results[p_index]);
    }

    // Calculate gradients on hidden layers.
    for (size_t l_index = this->layers.size() - 2; l_index > 0; l_index--) {
        auto&& hidden_layer = this->layers[l_index];
        auto&& next_layer = this->layers[l_index + 1];

        for (size_t p_index = 0; p_index < hidden_layer.count_perceptrons(); p_index++) {
            hidden_layer.get_perceptron(p_index).calc_hidden_gradients(next_layer);
        }
    }

    // Update the weights of all layers including input, hidden, and output layers.
    for (size_t l_index = this->layers.size() - 1; l_index > 0; l_index--) {
        auto&& curr_layer = this->layers[l_index];
        auto&& prev_layer = this->layers[l_index - 1];

        for (size_t p_index = 0; p_index < curr_layer.count_perceptrons(); p_index++) {
            curr_layer.get_perceptron(p_index).update_output_weights(prev_layer);
        }
    }
}

vector<double> Network::get_results() const {
    vector<double> results;

    // Read the output values of the perceptrons in the output layer.
    auto output_layer = this->layers.back();
    for (size_t p_index = 0; p_index < output_layer.count_perceptrons(); p_index++) {
        results.push_back(output_layer.get_perceptron(p_index).get_output_value());
    }

    return results;
}
