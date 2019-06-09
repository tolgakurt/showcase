#ifndef __NETWORK_H
#define __NETWORK_H

#include <vector>
#include "Layer.h"

enum class ActivationFunction;

class Network {
public:
    // topology: a vector of number of perceptrons in each layer
    // act_fun: passed down to the individual perceptrons, used when feeding forward
    Network(const std::vector<size_t>& topology, ActivationFunction act_fun);

    Network() = delete; // No default constructor.

    Network(const Network&) = delete; // No copy constructor.
    Network& operator=(const Network&) = delete; // No copy operator.

    Network(Network&&) = delete; // No move constructor.
    Network& operator=(Network&&) = delete; // No move operator.

    ~Network() {} // No acquired resources, nothing to destruct.

    void feed_forward(const std::vector<double>& input_values);
    void back_propagate(const std::vector<double>& expected_results);
    std::vector<double> get_results() const;

private:
    std::vector<Layer> layers;
};

#endif
