(function () {
    var callWithJQuery;

    callWithJQuery = function (pivotModule) {
        if (typeof exports === "object" && typeof module === "object") {
            return pivotModule(require("jquery"));
        } else if (typeof define === "function" && define.amd) {
            return define(["jquery"], pivotModule);
        } else {
            return pivotModule(jQuery);
        }
    };

    callWithJQuery(function ($) {


        var multifactSumAggregator = function (aggMap, derivedAggregations) {

            var allAggregators = $.map(aggMap, function (aggregation, key) {
                var agg = $.pivotUtilities.aggregators[aggregation.aggType];
                var _numInputs = agg([])().numInputs || 0;
                return {
                    aggregator: agg,
                    selfNumInputs: _numInputs,
                    name: aggregation.name,
                    key: key,
                    varName: aggregation.varName,
                    hidden: aggregation.hidden
                }
            });

            return function (facts) {
                //console.log('multifact sum agg called with ', facts);


                var aggregations = $.map(allAggregators, function (_agg) {

                    //console.log(aggMap[_agg.name].arguments);
                    return {
                        aggregator: _agg.aggregator(aggMap[_agg.key].arguments),
                        key: _agg.key,
                        name: _agg.name,
                        varName: _agg.varName,
                        hidden: _agg.hidden
                    };

                })


                return function (data, rowKey, colKey) {


                    var finalAggregators = $.map(aggregations, function (_agg) {
                        return {
                            aggregator: _agg.aggregator(data, rowKey, colKey),
                            key: _agg.key,
                            name: _agg.name,
                            varName: _agg.varName,
                            hidden: _agg.hidden
                        };

                    });

                    var _finalAggregatorsNameMap = {};
                    for (var i = 0, x = finalAggregators.length; i < x; i++) {
                        var aggregation = finalAggregators[i];
                        _finalAggregatorsNameMap[aggregation.name] = aggregation;

                    }

                    var _finalDerivedAggregatorsNameMap = {};
                    for (var i = 0, x = derivedAggregations.length; i < x; i++) {
                        var derivedAggregation = derivedAggregations[i];
                        _finalDerivedAggregatorsNameMap[derivedAggregation.name] = derivedAggregation;
                    }

                    //console.log(finalAggregators);

                    if (!facts && !!data && !!data.valAttrs) {
                        facts = data.valAttrs;
                    }
                    //console.log('aggregator called for', data, rowKey, colKey)

                    var analytics = {};


                    return {
                        label: "Facts",

                        push: function (record) {

                            for (var i = 0, x = finalAggregators.length; i < x; i++) {
                                var aggregation = finalAggregators[i];
                                //console.log('Final Aggregation', aggregation)
                                aggregation.aggregator.push(record);

                            }

                        },

                        multivalue: function () {

                            analytics = {};
                            var variables = {};

                            var finalAnalytics = {};


                            for (var i = 0, x = finalAggregators.length; i < x; i++) {
                                var aggregation = finalAggregators[i];
                                analytics[aggregation.name] = aggregation.aggregator.value();
                                variables[aggregation.varName] = analytics[aggregation.name];
                                if (!aggregation.hidden) {
                                    finalAnalytics[aggregation.name] = analytics[aggregation.name];
                                }

                            }

                            //console.log(analytics)

                            //console.log(variables);


                            var _derivedAnalytics = {};
                            for (var i = 0, x = derivedAggregations.length; i < x; i++) {
                                var derivedAggregation = derivedAggregations[i];
                                var derivedVal = 0;
                                var expression = 'derivedVal = ' + derivedAggregation.expression;
                                eval(expression);
                                _derivedAnalytics[derivedAggregation.name] = derivedVal;
                            }
                            //console.log(_derivedAnalytics);
                            finalAnalytics = $.extend(finalAnalytics, _derivedAnalytics)

                            return finalAnalytics;
                        },

                        // return the first element for unsupported renderers.
                        value: function () {
                            return 'Multi-Fact-Aggregator does not support single value';
                        },
                        format: function (x, aggKey) {
                            //console.log('i for formatter',i);
                            var formatter = null;
                            //console.log(_finalAggregatorsNameMap,aggKey)
                            if (!!_finalAggregatorsNameMap[aggKey]) {
                                formatter = _finalAggregatorsNameMap[aggKey].aggregator.format;
                            } else if (!!_finalDerivedAggregatorsNameMap[aggKey]) {
                                var formatterOptions = $.extend({}, _finalDerivedAggregatorsNameMap[aggKey].formatterOptions);

                                formatter = $.pivotUtilities.numberFormat(formatterOptions);
                            }

                            if (!formatter) {
                                formatter = $.pivotUtilities.numberFormat();
                            }
                            //console.log(formatter)
                            return formatter(x);


                        }


                    };
                };
            };
        }


        $.pivotUtilities.multifactSumAggregatorGenerator = multifactSumAggregator;

    });

}).call(this);

