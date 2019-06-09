#include <iostream>
#include "Layer.h"
#include "ActivationFunction.h"

using namespace std;

Layer::Layer(size_t p_count, size_t next_layer_p_count, ActivationFunction act_fun) {
    for (size_t p_index = 0; p_index < p_count; p_index++) {
        Perceptron perceptron(p_index, next_layer_p_count, act_fun);
        this->perceptrons.push_back(perceptron);
    }
}
