#ifndef __PERCEPTRON_H
#define __PERCEPTRON_H

#include <vector>

enum class ActivationFunction;
class Layer;

class Perceptron {
public:
    Perceptron(size_t p_index, size_t next_layer_p_count, ActivationFunction act_fun);

    Perceptron() = delete; // No default constructor.

    Perceptron(const Perceptron&) = default; // Default copy constructor.
    Perceptron& operator=(const Perceptron&) = delete; // No copy operator.

    Perceptron(Perceptron&&) = default; // Default move constructor.
    Perceptron& operator=(Perceptron&&) = delete; // No move operator.

    ~Perceptron() {} // No acquired resources, nothing to destruct.

    void set_output_value(double value);
    double get_output_value() const { return this->output_value; }
    void feed_forward(Layer& prev_layer);
    void calc_output_gradients(double expected_result);
    void calc_hidden_gradients(Layer& next_layer);
    void update_output_weights(Layer& prev_layer);

    static double learning_rate;

private:
    ActivationFunction act_fun;
    double call_act_fun(double x) const;
    double call_act_fun_der(double x) const;
    double output_value;
    std::vector<double> output_weights;
    std::vector<double> delta_weights;
    size_t index;
    double gradient;
};

#endif
