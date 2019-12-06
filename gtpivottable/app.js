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

    var _config = {
        "hiddenAttributes": [],
        "hiddenFromAggregators": [],
        "hiddenFromDragDrop": [],
        "menuLimit": 500,
        "cols": ["Gender"],
        "rows": ["Department", "Fee Paid"],
        "vals": ["Maths Marks"],
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
        "cols": ["Gender"],
        "rows": ["Department", "Fee Paid"],
        "vals": ["Maths Marks"],
        "rowOrder": "key_a_to_z",
        "colOrder": "key_a_to_z",
        "inclusions": {},
        "unusedAttrsVertical": 85,
        "autoSortUnusedAttrs": false,
        "onRefresh": null,
        "showUI": true,
        "inclusionsInfo": {},
        "aggregatorName": "Average",
        "rendererName": "GT Table"
    };

    var mini = true;

    var config = mini ? _miniconfig : _config;


    Papa.parse((mini ? 'mini-' : '') + 'data.csv', {
        download: true,
        skipEmptyLines: true,
        complete: function (parsed) {

            renderPivot(parsed.data);
        }
    });

    config.aggregators = $.extend($.pivotUtilities.aggregators, {});

    config.renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.customRenderer);

    var renderPivot = function (data) {

        $("#output").pivotUI(
            data,
            config
        );
    }

});