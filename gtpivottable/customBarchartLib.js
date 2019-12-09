(function () {
    var callWithJQuery,
        indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        },
        slice = [].slice,
        bind = function (fn, me) {
            return function () {
                return fn.apply(me, arguments);
            };
        },
        hasProp = {}.hasOwnProperty;

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
        $.fn.gtBarchart = function(opts) {
            var barcharter, i, l, numCols, numRows, ref;
            numRows = this.data("numrows");
            numCols = this.data("numcols");

            var _finalAggregatorsNameMap = {};
            var finalAggregators = $.map(opts.aggregations.defaultAggregations, function (aggregation) {
                return aggregation;
            }) || [];
            for (i = 0, x = finalAggregators.length; i < x; i++) {
                var aggregation = finalAggregators[i];
                _finalAggregatorsNameMap[aggregation.name] = aggregation;

            }

            var derivedAggregations = opts.aggregations.derivedAggregations || [];
            var _finalDerivedAggregatorsNameMap = {};
            for (i = 0, x = derivedAggregations.length; i < x; i++) {
                var derivedAggregation = derivedAggregations[i];
                _finalDerivedAggregatorsNameMap[derivedAggregation.name] = derivedAggregation;
            }

            var aggregationMap = $.extend(true, {}, _finalAggregatorsNameMap, _finalDerivedAggregatorsNameMap)


            barcharter = (function(_this) {
                return function(scope) {
                    var forEachCell, max, min, range, values, valueSets;
                    forEachCell = function(f) {
                        return _this.find(scope).each(function() {
                            var x, valueAttributeKey;
                            x = $(this).data("value");
                            valueAttributeKey = $(this).data("value-for");
                            if ((x != null) && isFinite(x)) {
                                return f(x, $(this), valueAttributeKey);
                            }
                        });
                    };
                    values = [];
                    valueSets = {};
                    forEachCell(function(x, elem, valueAttributeKey) {
                        valueSets[valueAttributeKey] = valueSets[valueAttributeKey] || [];
                        valueSets[valueAttributeKey].push(x);
                        return values.push(x);
                    });

                    var scalerSet = {};

                    Object.keys(valueSets).forEach(function(key){
                        if(valueSets.hasOwnProperty(key)){

                            max = Math.max.apply(Math, values);
                            if (max < 0) {
                                max = 0;
                            }

                            range = max;

                            min = Math.min.apply(Math, values);
                            if (min < 0) {
                                range = max - min;
                            }
                            scalerSet[key] = (function(){ return function(x) {
                                return 100 * x / (1.4 * range);
                            }})();
                        }
                    });


                    return forEachCell(function(x, elem, valueAttributeKey) {
                        var bBase, bgColor, text, wrapper, scaler;
                        scaler = scalerSet[valueAttributeKey];

                        var opts = aggregationMap[valueAttributeKey];

                        if(opts && opts.renderEnhancement ==='barchart'){
                            text = elem.text();
                            wrapper = $("<div>").css({
                                "position": "relative",
                                "width": "120px"
                            });
                            bgColor = opts.barchartColor || "steelblue";
                            bBase = 0;
                            if (min < 0) {
                                bBase = scaler(-min);
                            }
                            if (x < 0) {
                                bBase += scaler(x);
                                bgColor = opts.barchartNegativeColor || "darkred";
                                x = -x;
                            }
                            wrapper.append($("<div>").css({
                                "position": "absolute",
                                "top": bBase + "%",
                                "left": 0,
                                //"right": 0,
                                "height" : "12px",
                                "width": scaler(x) + "%",
                                "background-color": bgColor
                            }));
                            wrapper.append($("<div>").text(text).css({
                                "position": "relative",
                                "padding-left": "5px",
                                "padding-right": "5px"
                            }));
                            return elem.css({
                                "padding": 0,
                                "padding-top": "5px",
                                "text-align": "right"
                            }).html(wrapper);
                        } else {
                            return elem;
                        }

                    });
                };
            })(this);
            for (i = l = 0, ref = numRows; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
                barcharter(".pvtVal.row" + i);
            }
            //barcharter(".pvtTotal.colTotal");
            return this;
        };
    });

}).call(this);