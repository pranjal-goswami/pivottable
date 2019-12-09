function buildMultiAggregator(names) {
    var numInputs = 0;
    var aggregators = $.map(names, function(a) {
        var agg = $.pivotUtilities.aggregators[a];
        var ni = agg([])().numInputs || 0;
        numInputs += ni;
        return {
            aggregator: agg,
            numInputs: ni,
            name: a
        }
    });
    return function multiAggregator(facts) {
        var offset = 0;
        var factsAggs = $.map(aggregators, function(a) {
            var next = offset + a.numInputs;
            var f = facts.slice(offset, next);
            var fa = a.aggregator(f);
            offset = next;
            return {
                aggregator: fa,
                name: a.name + ''
            };
        });
        return function (data, rowKey, colKey) {
            var aggs = $.map(factsAggs, function(a, i) {
                var agg = a.aggregator(data, rowKey, colKey);
                if(agg.inner) {
                    //This is detection that we have a fractionOf aggregator that needs to be "fixed"
                    agg.value = function() {
                        var parent = data.getAggregator.apply(data, this.selector);
                        if(parent.multivalue)
                            parent = parent.multivalue()[i].aggregator;
                        return this.inner.value() / parent.inner.value();
                    }
                }
                return {
                    aggregator: agg,
                    name: a.name
                };
            });
            return {
                push: function (record) {
                    for(var i = 0 ; i < aggs.length; i++) {
                        aggs[i].aggregator.push(record);
                    }
                },
                multivalue: function () {
                    return aggs;
                },
                value: function (i) {
                    i = i || 0;
                    return aggs[i].aggregator.value();
                },
                format: function (x, i) {
                    i = i || 0;
                    return aggs[i].aggregator.format(x);
                },
                numInputs: numInputs
            };
        };
    };
}