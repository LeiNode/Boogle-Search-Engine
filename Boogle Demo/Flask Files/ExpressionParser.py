import re

class ExpressionParser:
    # constructor
    def __init__(self, query, descriptor_list):
        self.query = query
        self.descriptor_list = descriptor_list

    @staticmethod
    def tokenize(query):
        """Splits query into tokens (words and boolean operators)."""
        return re.findall(r'AND|OR|NOT|[A-Za-z0-9_]+|\(|\)', query)

    @staticmethod
    def parse_expression(tokens):
        """Recursive descent parser for Boolean expressions."""
        
        def parse_term(index):
            token = tokens[index]
            if token == "NOT":
                node, next_index = parse_term(index + 1)
                return ("NOT", node), next_index
            elif token == "(":
                node, next_index = parse_or(index + 1)
                if tokens[next_index] != ")":
                    raise ValueError("Missing closing parenthesis")
                return node, next_index + 1
            else:
                return ("WORD", token), index + 1

        def parse_and(index):
            left, index = parse_term(index)
            while index < len(tokens) and tokens[index] != "OR" and tokens[index] != ")":
                if tokens[index] == "AND":
                    index += 1  # skip explicit AND
                # Implicit AND between consecutive terms
                right, index = parse_term(index)
                left = ("AND", left, right)
            return left, index

        def parse_or(index):
            left, index = parse_and(index)
            while index < len(tokens) and tokens[index] == "OR":
                right, index = parse_and(index + 1)
                left = ("OR", left, right)
            return left, index

        tree, next_index = parse_or(0)
        if next_index != len(tokens):
            raise ValueError("Unexpected tokens at end")
        return tree

    def evaluate(self, expr, sentence):
        """Evaluate parsed expression against a sentence (case-sensitive)."""
        etype = expr[0]

        if etype == "WORD":
            word = expr[1]
            return word in sentence  # case-sensitive check

        if etype == "NOT":
            return not self.evaluate(expr[1], sentence)

        if etype == "AND":
            return self.evaluate(expr[1], sentence) and self.evaluate(expr[2], sentence)

        if etype == "OR":
            return self.evaluate(expr[1], sentence) or self.evaluate(expr[2], sentence)

        raise ValueError("Invalid expression")
    
    def filter_descriptors(self):
        tokens = self.tokenize(self.query)
        tree = self.parse_expression(tokens)

        result_indexes = []
        for i, sentence in enumerate(self.descriptor_list):
            if self.evaluate(tree, sentence):
                result_indexes.append(i)

        return result_indexes