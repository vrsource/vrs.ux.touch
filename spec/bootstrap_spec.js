/** Pull in the imports for jasmine-species **/

// Pull in the jasmine-species stuff into globals (TODO: Find better way)
/** SUITES (describe) **/
feature   = jasmine.grammar.FeatureStory.feature;
story     = jasmine.grammar.FeatureStory.story;
component = jasmine.grammar.FeatureStory.component;

concern   = jasmine.grammar.ContextSpecification.concern;
context   = jasmine.grammar.ContextSpecification.context;

/** SPECS (it) */
scenario = jasmine.grammar.FeatureStory.scenario;
spec     = jasmine.grammar.ContextSpecification.spec;

/** Steps (run) */
given = jasmine.grammar.GWT.given;
when  = jasmine.grammar.GWT.when;
then  = jasmine.grammar.GWT.then;
and   = jasmine.grammar.GWT.and;
but   = jasmine.grammar.GWT.but;

_addStepToCurrentSpec = jasmine.grammar.GWT._addStepToCurrentSpec;

// Setup some matchers as helpers
jasmine.Matchers.prototype.toBeEmpty = function() {
   return this.actual.length === 0;
};

jasmine.Matchers.prototype.toBeLength = function(expected) {
   return (this.actual.length === expected);
};

/** Create a namespace for things in the testing. */
Ext.ns('test');
