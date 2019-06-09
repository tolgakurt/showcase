#ifndef __LAYER_H
#define __LAYER_H

#include <vector>
#include "Perceptron.h"

enum class ActivationFunction;

class Layer {
public:
    Layer(size_t p_count, size_t next_layer_p_count, ActivationFunction act_fun);

    Layer() = delete; // No default constructor.

    Layer(const Layer&) = default; // Default copy constructor.
    Layer& operator=(const Layer&) = delete; // No copy operator.

    Layer(Layer&&) = default; // Default move constructor.
    Layer& operator=(Layer&&) = delete; // No move operator.

    ~Layer() {} // No acquired resources, nothing to destruct.

    Perceptron& get_perceptron(size_t index) { return this->perceptrons[index]; }
    size_t count_perceptrons() const { return this->perceptrons.size(); }

private:
    std::vector<Perceptron> perceptrons;
};

#endif
