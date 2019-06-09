#include <cstdlib>
#include <cmath>
#include <vector>
#include "Layer.h"
#include "ActivationFunction.h"

using namespace std;

Perceptron::Perceptron(size_t p_index, size_t next_layer_p_count, ActivationFunction act_fun)
    : index(p_index), act_fun(act_fun) {
    // Create random weights and set them for each perceptron in the next layer.
    for (size_t p_index = 0; p_index < next_layer_p_count; p_index++) {
        auto rand_weight = static_cast<double>(rand()) / static_cast<double>(RAND_MAX);
        this->output_weights.push_back(rand_weight);
    }
}

void Perceptron::set_output_value(double value) {
    this->output_value = value;
}

void Perceptron::feed_forward(Layer& prev_layer) {
    auto sum = 0.0;

    // Sum the previous layer's outputs.
    for (size_t p_index = 0; p_index < prev_layer.count_perceptrons(); p_index++) {
        auto&& perceptron = prev_layer.get_perceptron(p_index);
        sum = sum + perceptron.get_output_value() * perceptron.output_weights[this->index];
    }

    this->output_value = this->call_act_fun(sum);
}

void Perceptron::calc_output_gradients(double expected_result) {
    auto delta = expected_result - this->output_value;
    this->gradient = delta * this->call_act_fun_der(this->output_value);
}

void Perceptron::calc_hidden_gradients(Layer& next_layer) {
    auto sum = 0.0;

    // Sum our contributions of the errors at the nodes we feed.
    for (size_t p_index = 0; p_index < next_layer.count_perceptrons(); p_index++) {
        sum = sum + this->output_weights[p_index] * next_layer.get_perceptron(p_index).gradient;
    }

    this->gradient = sum * this->call_act_fun_der(this->output_value);
}

double Perceptron::call_act_fun(double x) const {
    switch (this->act_fun) {
    case ActivationFunction::Sigmoidal:
        return 1.0 / (1.0 + exp(-x));

    case ActivationFunction::Linear:
        return 0.1 * x;

    case ActivationFunction::Tangential:
        return tanh(x);
    }

    throw std::runtime_error("Unknown activation function.");
}

double Perceptron::call_act_fun_der(double y) const {
    switch (this->act_fun) {
    case ActivationFunction::Sigmoidal:
        return y * (1.0 - y);

    case ActivationFunction::Linear:
        return 0.1;

    case ActivationFunction::Tangential:
        return (1 - y * y);
    }

    throw std::runtime_error("Unknown activation function.");
}

void Perceptron::update_output_weights(Layer& prev_layer) {
    for (size_t p_index = 0; p_index < prev_layer.count_perceptrons(); p_index++) {
        Perceptron& perceptron = prev_layer.get_perceptron(p_index);

        auto delta_weight = Perceptron::learning_rate * perceptron.get_output_value() * this->gradient;
        perceptron.output_weights[this->index] = perceptron.output_weights[this->index] + delta_weight;
    }
}

double Perceptron::learning_rate = 0.0;
