var copyPivotConfig = function () {
    var config = $('#output').data('pivotUIOptions');
    console.log(config);
    var configCopy = $.extend({}, config);
    delete configCopy.aggregators;
    delete configCopy.renderers;
    delete configCopy.dataClass;
    delete configCopy.derivedAttributes;
    delete configCopy.exclusions;
    delete configCopy.filter;
    delete configCopy.rendererOptions;
    delete configCopy.sorters;
    delete configCopy.localeStrings;
    console.log(configCopy);
    console.log(JSON.stringify(configCopy));

}

$(function () {


    var aggMap = {
        'agg1': {
            aggType: 'Count',
            arguments: ['English Marks'],
            name: 'Count of English Marks',
            varName :'a',
            renderEnhancement : 'heatmap'
        },

        'agg2': {
            aggType: 'Average',
            arguments: ['History Marks'],
            name: 'Avg(History)',
            varName :'b',
            hidden : true,
            renderEnhancement : 'barchart'
        },
        'agg3': {
            aggType: 'Sum',
            arguments: ['Maths Marks'],
            name: 'Sum(Maths)',
            varName :'c',
            hidden : false,
            renderEnhancement : 'heatmap'
        }
    };

    var derivedAggregations = [
        {
            name : 'Avg GPA',
            description : 'sum Maths marks / avg Math marks',
            expression : 'variables.b*100/variables.c',
            renderEnhancement : 'barchart',
            barchartColor : '#fa983a',
            formatterOptions : {
                digitsAfterDecimal: 1,
                scaler: 1,
                suffix: "%"
            }
        },
        {
            name : 'Success Score',
            description : 'Count of English Marks / Avg. of Maths Marks',
            expression : 'variables.a/variables.b',
            renderEnhancement : 'heatmap'
        }
    ];

    var customAggs = {};
    customAggs['Multifact Aggregators'] = $.pivotUtilities.multifactSumAggregatorGenerator(aggMap,derivedAggregations);

    var _config = {
        "hiddenAttributes": [],
        "hiddenFromAggregators": [],
        "hiddenFromDragDrop": [],
        "menuLimit": 500,
        "cols": ["Gender"],
        "rows": ["Department", "Fee Paid"],
        "vals": ["Maths Marks", "English Marks"],
        "rowOrder": "key_a_to_z",
        "colOrder": "key_a_to_z",
        "inclusions": {},
        "unusedAttrsVertical": 85,
        "autoSortUnusedAttrs": false,
        "onRefresh": null,
        "showUI": true,
        "inclusionsInfo": {},
        "aggregatorName": "Average",
        "rendererName": "Table Barchart"
    };

    var _miniconfig = {
        "hiddenAttributes": [],
        "hiddenFromAggregators": [],
        "hiddenFromDragDrop": [],
        "menuLimit": 500,
        "cols": ["Gender" ],
        "rows": ["Department"],
        "vals": [],
        "rowOrder": "key_a_to_z",
        "colOrder": "key_a_to_z",
        "inclusions": {},
        "unusedAttrsVertical": 85,
        "autoSortUnusedAttrs": false,
        "onRefresh": null,
        "showUI": true,
        "inclusionsInfo": {},
        "aggregatorName": "Multifact Aggregators",
        "rendererName": "GT Table Heatmap and Barchart",
        "rendererOptions" : {

            aggregations : {
                defaultAggregations : aggMap,
                derivedAggregations : derivedAggregations

            },
            heatmap: {
                colorScaleGenerator: function(values,statKey) {
                    // Plotly happens to come with d3 on board
                    var max, min;
                    min = Math.min.apply(Math, values);
                    max = Math.max.apply(Math, values);

                    var customColorRange = {
                        'Avg GPA':["#FFF", "#6a89cc"],
                        'Avg(History)':["#FFF", "#78e08f"],
                        'Count of English Marks' : ["#FFF", "#e55039"],
                        'Sum(Maths)' : ["#FFF", "#fff"],
                        'Success Score' : ["#FFF", "#38ada9"],
                    };

                    var colorRange = customColorRange[statKey] || ["#FFF", "#6a89cc"];





                    //For single color scale
                    return Plotly.d3.scale.linear()
                        .domain([min, max])
                        .range(colorRange);

                    /**
                     * For 2 color scale
                     *
                     return Plotly.d3.scale.linear()
                     .domain([stats.min, stats.mid, stats.max])
                     .range(["#FFF", "#midcolor","#38ada9"])
                     */
                }
            }
        }
    };

    var mini = true;

    var config = mini ? _miniconfig : _config;


    Papa.parse((mini ? 'medium-' : '') + 'data.csv', {
        download: true,
        skipEmptyLines: true,
        complete: function (parsed) {

            renderPivot(parsed.data);
        }
    });





    $.pivotUtilities.customAggs = customAggs;

    config.aggregators = $.extend($.pivotUtilities.aggregators, $.pivotUtilities.customAggs);

    config.renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.gtRenderers);

    var renderPivot = function (data) {

        $("#output").pivotUI(
            data,
            config
        );
    }

});