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
        var qry = "SELECT DISTINCT("+field_list[i]+") as row_"+i+" from ?";
        var data = alasql(qry, [parameter]);
        distinct_list.push(data);
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
