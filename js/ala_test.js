var setCellMapping = function (col_list, row_list, aggregation_field) {
    // cell mapping result list
    var cell_mapping_list = [];

    // column count list
    var col_count_list = [];
    for(var i in col_list){
        col_count_list.push(col_list[i].length);
    }
    col_count_list.push(aggregation_field.length);

    // row count list
    var row_count_list = [];
    for(var i in row_list){
        row_count_list.push(row_list[i].length);
    }

    // total columns count
    var total_col_cnt = 1;
    for(i in col_count_list){
        total_col_cnt = total_col_cnt * col_count_list[i];
    }

    // prepare col_mapping_list(columns)
    for(var i = 0; i < total_col_cnt; i ++){
        col_mapping_list.push([]);
    }

    // pivot column cell
    var col_mapping_list = [];
    for(var i in col_count_list){
        var cnt = 0;

        // i를 기준으로 후위 필드 cnt
        var col_cnt_1 = 1;
        for(var j = Number(i) + 1; j < col_count_list.length; j ++){
            col_cnt_1 = col_cnt_1 * col_count_list[j];
        }

        // i를 기준으로 전위 필드 cnt
        var count_list_2 = $.extend(true, [], col_count_list);
        count_list_2 = count_list_2.splice(0, i)
        var co_cnt_2 = 1;
        for(var j in count_list_2){
            co_cnt_2 = co_cnt_2 * count_list_2[j];
        }

        // columns 기준으로 cell 값 넣기
        if(Number(i) !== col_count_list.length - 1){
            for(var m = 0; m < co_cnt_2; m++){
                for(var j in col_list[i]){
                    for (var l = 0; l < col_cnt_1; l ++){
                        col_mapping_list[cnt].push(col_list[i][j])
                        cnt++;
                    }
                }
            }
        }else{
            for(var j = 0; j < total_col_cnt/aggregation_field.length; j++){
                for(var i in aggregation_field){
                    col_mapping_list[cnt].push(aggregation_field[i].calculate + '_' + aggregation_field[i].field)
                    cnt++;
                }
            }
        }
    }

    // pivot column cell
    var row_mapping_list = []
    for(var i in row_count_list){

    }
    return cell_mapping_list;
}


var getPivotQry = function(row_field, col_field, aggregation_field){
    // get pivot raw data
    var field_str = 'SELECT ';

    for(var i in row_field)
        field_str = field_str + row_field[i] + ','

    for(var i in col_field)
        field_str = field_str + col_field[i] + ','

    var result_list = [];

    for(var i in aggregation_field){
        var field = aggregation_field[i].field;
        var calculate = aggregation_field[i].calculate;
        var agg_field = ' ("'+calculate+'_" + ? + "_" + '+row_field[0]+') AS '+calculate + '_' +field+', ['+field+'] FROM ? PIVOT ('+calculate+'(['+field+']) FOR '+calculate + '_' +field+')'
        var qry = field_str + agg_field;
        var data = alasql(qry, [field, parameter]);
        result_list.push(data);
    }

    return result_list;
}

var getDistinctQry = function(field_list){
    var distinct_list = [];
    for(var i in field_list){
        var d_list = [];
        var qry = "SELECT DISTINCT("+field_list[i]+") as distinct_field from ?";
        var data = alasql(qry, [parameter]);
        for (var i in data){
            d_list.push(data[i]['distinct_field'])
        }
        distinct_list.push(d_list);
    }
    return distinct_list;
}

var drawPivotTable = function(row_list, col_list, aggregation_field){
    // Draw Table
    var title_row = 0;
    var title_col = 0;

    for(var i in row_list)
        title_row += 1;

    for(var i in col_list)
        title_col += 1;

    if(aggregation_field.length !== 0)
        title_col += 1;

    var html = '<table>'
    for(var i in col_list){
        html += '<tr>'
        if(Number(i) === 0){
            html += '<th colspan="'+title_row+'" rowspan="'+title_col+'"></th>'
        }

        var colspan_cnt = 1;
        for(j = Number(i)+1; j < col_list.length; j++){
            colspan_cnt = colspan_cnt*(col_list[j].length)
        }

        if(Number(i) !== 0){
            var col_cnt = 1;
            for(var l = 0; l < i; l ++){
                col_cnt = col_cnt * col_list[l].length;
            }
            for(var l = 1; l <= col_cnt; l++){
                for(var j in col_list[i]){
                    var val = col_list[i][j]['col_'+i]
                    html += '<th colspan="'+colspan_cnt*(aggregation_field.length)+'">'+val+'</th>'
                }
            }
        }else{
            for(var j in col_list[i]){
                var val = col_list[i][j]['col_'+i]
                html += '<th colspan="'+colspan_cnt*(aggregation_field.length)+'">'+val+'</th>'
            }
        }
        html += '</tr>'
    }

    // aggregation
    html += '<tr>'

    var aggregation_cnt = 1;
    for(i in col_list){
        aggregation_cnt = aggregation_cnt * col_list[i].length;
    }

    for(var j = 0; j < aggregation_cnt; j++){
        for(var i in aggregation_field){
            html += '<th>'+aggregation_field[i].calculate + ' of ' + aggregation_field[i].field+'</th>'
        }
    }

    html += '</tr>'
    html += '</table>'

    return html;
}
