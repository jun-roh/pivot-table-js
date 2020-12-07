// pivot query using alasql
const getPivotQry = function (row_list, col_list, aggregation_field, pivot_list, row_field_list, col_field_list) {
    let row_field = []; // 행 field List
    let col_field = []; // 열 field List
    let where_str = "where "
    for (let i in row_list){
        row_field.push(row_list[i].key);
        // 제한을 둘 경우 해당 데이터만 pivot 하기 위해서 where 절 만듬
        where_str += row_list[i].key + " in ("
        for (let j in row_field_list[i]){
            where_str += "'" + row_field_list[i][j] + "'"
            if (Number(j) !== getListLength(row_field_list[i], false) -1){
                where_str += ","
            }
        }
        where_str += ")";
        if (Number(i) !== getListLength(row_list, false) -1){
            where_str += " and "
        }
    }
    for (let i in col_list){
        col_field.push(col_list[i].key);
        // 제한을 둘 경우 해당 데이터만 pivot 하기 위해서 where 절 만듬
        where_str += " and " + col_list[i].key + " in (";
        for (let j in col_field_list[i]){
            where_str += "'" + col_field_list[i][j] + "'";
            if (Number(j) !== getListLength(col_field_list[i], false) -1){
                where_str += ","
            }
        }
        where_str += ")";
    }

    // 열 제한으로 나온 column 의 데이터만으로 pivoting 하기 위해서 origin pivot 데이터를 줄임
    let qry_str = 'select * from ? ' + where_str;
    alasql.options.cache = false;
    let re_data = alasql(qry_str, [pivot_list]);

    // get pivot raw data
    let field_str = 'SELECT ';

    for (let i in row_field) {
        let row_field_str = row_field[i];
        field_str = field_str + row_field_str + ','
    }

    for (let i in col_field)
        field_str = field_str + col_field[i] + ',';

    var result_list = [];
    // 각각의 aggregation 마다 Pivot 계산하여 결과를 result_list List 에 추가
    for (let i in aggregation_field) {
        let field = aggregation_field[i].key;
        let calculate = aggregation_field[i].calculate;
        let agg_field = ' ("' + calculate + '_" + ? ) AS ' + calculate + '_' + field +
            ', [' + field + '] FROM ? PIVOT (' + calculate.toUpperCase() + '(' + field + ') FOR ' + calculate + '_' + field + ')';
        let qry = field_str + agg_field;
        // 여러번 query 를 실행하기 위해서 cache 를 해지 해야함
        alasql.options.cache = false;
        let data = alasql(qry, [field, re_data]);
        result_list.push(data);
    }
    return result_list;
};

// Pivot Distinct Query
const getDistinctQry = function (field_list, data_list) {
    let distinct_list = [];
    for (let i in field_list) {
        let d_list = [];
        let qry = "SELECT DISTINCT(" + field_list[i].key + ") as distinct_field from ? order by " + field_list[i].key;
        alasql.options.cache = false;
        let data = alasql(qry, [data_list]);
        for (let i in data) {
            d_list.push(data[i]['distinct_field'])
        }
        distinct_list.push(d_list);
    }
    return distinct_list;
};
