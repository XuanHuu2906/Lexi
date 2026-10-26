
package com.lexi.grammar.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class UpdateGrammarRequest {

    @Size(max = 200)
    private String title;

    private String formula;
    private String explanation;

    private List<@NotNull String> examples;

    private boolean titleProvided;
    private boolean formulaProvided;
    private boolean explanationProvided;
    private boolean examplesProvided;

    @JsonSetter("title")
    public void setTitle(String value) {
        this.titleProvided = true;
        this.title = value;
    }

    @JsonSetter("formula")
    public void setFormula(String value) {
        this.formulaProvided = true;
        this.formula = value;
    }

    @JsonSetter("explanation")
    public void setExplanation(String value) {
        this.explanationProvided = true;
        this.explanation = value;
    }

    @JsonSetter("examples")
    public void setExamples(List<String> value) {
        this.examplesProvided = true;
        this.examples = value;
    }

    public String getTitle() {
        return title;
    }

    public String getFormula() {
        return formula;
    }

    public String getExplanation() {
        return explanation;
    }

    public List<String> getExamples() {
        return examples;
    }

    @JsonIgnore
    public boolean isTitleProvided() {
        return titleProvided;
    }

    @JsonIgnore
    public boolean isFormulaProvided() {
        return formulaProvided;
    }

    @JsonIgnore
    public boolean isExplanationProvided() {
        return explanationProvided;
    }

    @JsonIgnore
    public boolean isExamplesProvided() {
        return examplesProvided;
    }

    @AssertTrue(message = "formula must not be blank")
    @JsonIgnore
    public boolean isFormulaValid() {
        return !formulaProvided
            || (formula != null && !formula.isBlank());
    }

    @AssertTrue(message = "explanation must not be blank")
    @JsonIgnore
    public boolean isExplanationValid() {
        return !explanationProvided
            || (explanation != null && !explanation.isBlank());
    }

    @AssertTrue(message = "examples must not be null")
    @JsonIgnore
    public boolean isExamplesValid() {
        return !examplesProvided || examples != null;
    }
}
