// pivot query using alasql
const getPivotQry = function (row_list, col_list, aggregation_field, pivot_list) {
    var row_field = []; // 행 field List
    var col_field = []; // 열 field List

    for (var i in row_list)
        row_field.push(row_list[i].key);

    for (var i in col_list)
        col_field.push(col_list[i].key);

    // get pivot raw data
    var field_str = 'SELECT ';

    for (var i in row_field) {
        var row_field_str = row_field[i];
        field_str = field_str + row_field_str + ','
    }

    for (var i in col_field)
        field_str = field_str + col_field[i] + ',';

    var result_list = [];
    // 각각의 aggregation 마다 Pivot 계산하여 결과를 result_list List 에 추가
    for (var i in aggregation_field) {
        var field = aggregation_field[i].key;
        var calculate = aggregation_field[i].calculate;
        var agg_field = ' ("' + calculate + '_" + ? ) AS ' + calculate + '_' + field +
            ', [' + field + '] FROM ? PIVOT (' + calculate.toUpperCase() + '(' + field + ') FOR ' + calculate + '_' + field + ')';
        var qry = field_str + agg_field;
        // 여러번 query 를 실행하기 위해서 cache 를 해지 해야함
        alasql.options.cache = false;
        var data = alasql(qry, [field, pivot_list]);
        result_list.push(data);
    }
    return result_list;
};

// Pivot Distinct Query
const getDistinctQry = function (field_list, data_list) {
    var distinct_list = [];
    for (var i in field_list) {
        var d_list = [];
        var qry = "SELECT DISTINCT(" + field_list[i].key + ") as distinct_field from ? order by " + field_list[i].key;
        alasql.options.cache = false;
        var data = alasql(qry, [data_list]);
        for (var i in data) {
            d_list.push(data[i]['distinct_field'])
        }
        distinct_list.push(d_list);
    }
    return distinct_list;
};
