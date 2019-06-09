#ifndef __IOMANAGER_H
#define __IOMANAGER_H

#include <vector>
#include <string>

enum class ActivationFunction;

class IOManager {
public:
    IOManager() {}

    IOManager(const IOManager&) = delete; // No copy constructor.
    IOManager& operator=(const IOManager&) = delete; // No copy operator.

    IOManager(IOManager&&) = delete; // No move constructor.
    IOManager& operator=(IOManager&&) = delete; // No move operator.

    ~IOManager() {} // No acquired resources, nothing to destruct.

    void read_input(const std::string& filename);
    std::string get_dataset_filename() const { return this->dataset_filename; }
    std::string get_output_filename() const {
        std::string output_filename = this->dataset_filename;
        output_filename.replace(
            output_filename.end() - 4,
            output_filename.end(),
            "output"
        );
        return output_filename;
    }
    int get_topology_count() const { return this->topology_count; }
    std::vector<size_t> get_topology(int t_index) const { return this->topologies[t_index]; }
    std::vector<std::vector<double>> get_input_values() const { return this->input_values; }
    std::vector<std::vector<double>> get_expected_outputs() const { return this->expected_outputs; }
    std::vector<ActivationFunction> get_act_funs() const { return this->act_funs; }
    std::vector<double> get_learning_rates() const { return this->learning_rates; }
    int get_number_of_epochs() const { return this->number_of_epochs; }

private:
    int topology_count;
    std::vector<std::vector<size_t>> topologies; // {first topology, second topology, ...}
    std::string dataset_filename;
    int number_of_features;
    std::vector<ActivationFunction> act_funs; // {activation function for topology 1, ...}
    std::vector<double> learning_rates;
    int number_of_epochs;
    std::vector<std::vector<double>> input_values; // {{feature 1, feature 2, ...}, {feature 1, feature 2, ...}, ...}
    std::vector<std::vector<double>> expected_outputs; // {expected outputs of row 1, expected outputs of row 2, ...}

    void read_dataset();

    std::vector<unsigned> split_line_to_unsigned(const std::string& line) const;
    std::vector<double> split_line_to_double(const std::string& line) const;
};

#endif
