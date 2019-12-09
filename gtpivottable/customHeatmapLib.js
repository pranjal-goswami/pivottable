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
        $.fn.gtHeatmap = function (scope, opts) {
            var colorScaleGenerator, heatmapper, i, x, j, l, n, numCols, numRows, ref, ref1, ref2, _finalAggregatorsNameMap, _finalDerivedAggregatorsNameMap;
            if (scope == null) {
                scope = "heatmap";
            }
            numRows = this.data("numrows");
            numCols = this.data("numcols");


            _finalAggregatorsNameMap = {};
            var finalAggregators = $.map(opts.aggregations.defaultAggregations, function (aggregation) {
                return aggregation;
            }) || [];
            for (i = 0, x = finalAggregators.length; i < x; i++) {
                var aggregation = finalAggregators[i];
                _finalAggregatorsNameMap[aggregation.name] = aggregation;

            }

            var derivedAggregations = opts.aggregations.derivedAggregations || [];
            _finalDerivedAggregatorsNameMap = {};
            for (i = 0, x = derivedAggregations.length; i < x; i++) {
                var derivedAggregation = derivedAggregations[i];
                _finalDerivedAggregatorsNameMap[derivedAggregation.name] = derivedAggregation;
            }

            var aggregationMap = $.extend(true, {}, _finalAggregatorsNameMap, _finalDerivedAggregatorsNameMap)


            colorScaleGenerator = opts != null ? (ref = opts.heatmap) != null ? ref.colorScaleGenerator : void 0 : void 0;
            if (colorScaleGenerator == null) {
                colorScaleGenerator = function (values) {
                    var max, min;
                    min = Math.min.apply(Math, values);
                    max = Math.max.apply(Math, values);
                    return function (x) {
                        var nonRed;
                        nonRed = 255 - Math.round(255 * (x - min) / (max - min));
                        return "rgb(255," + nonRed + "," + nonRed + ")";
                    };
                };
            }
            heatmapper = (function (_this) {
                return function (scope) {
                    var colorScale, forEachCell, values, valueSets, colorScaleSets;
                    forEachCell = function (f) {
                        return _this.find(scope).each(function () {
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
                    forEachCell(function (x, elem, valueAttributeKey) {
                        valueSets[valueAttributeKey] = valueSets[valueAttributeKey] || [];
                        valueSets[valueAttributeKey].push(x);
                        return values.push(x);
                    });
                    console.log(valueSets);

                    colorScaleSets = {};
                    Object.keys(valueSets).forEach(function(key){
                        if(valueSets.hasOwnProperty(key)){
                            colorScaleSets[key] = colorScaleGenerator(valueSets[key], key)
                        }
                    });

                    return forEachCell(function (x, elem, valueAttributeKey) {
                        var opts = aggregationMap[valueAttributeKey];
                        if(opts && opts.renderEnhancement ==='heatmap'){
                            return elem.css("background-color", colorScaleSets[valueAttributeKey](x));
                        } else {
                            return elem;
                        }

                    });
                };
            })(this);
            switch (scope) {
                case "heatmap":
                    heatmapper(".pvtVal");
                    break;
                case "rowheatmap":
                    for (i = l = 0, ref1 = numRows; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
                        heatmapper(".pvtVal.row" + i);
                    }
                    break;
                case "colheatmap":
                    for (j = n = 0, ref2 = numCols; 0 <= ref2 ? n < ref2 : n > ref2; j = 0 <= ref2 ? ++n : --n) {
                        heatmapper(".pvtVal.col" + j);
                    }
            }
            heatmapper(".pvtTotal.rowTotal");
            heatmapper(".pvtTotal.colTotal");
            return this;
        };
    });

}).call(this);