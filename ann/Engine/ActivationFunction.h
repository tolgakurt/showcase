#ifndef __ACTIVATIONFUNCTION_H
#define __ACTIVATIONFUNCTION_H

enum class ActivationFunction {
    Sigmoidal = 0, // represents 1 / (1 + exp(-x))
    Linear, // represents 0.1x
    Tangential // represents tanh(x)
};

#endif
