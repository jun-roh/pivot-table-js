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


    var col_mapping_list = [];
    // prepare col_mapping_list(columns)
    for(var i = 0; i < total_col_cnt; i ++){
        col_mapping_list.push([]);
    }

    // pivot column cell
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
        var col_cnt_2 = 1;
        for(var j in count_list_2){
            col_cnt_2 = col_cnt_2 * count_list_2[j];
        }

        // columns 기준으로 cell 값 넣기
        if(Number(i) !== col_count_list.length - 1){
            for(var m = 0; m < col_cnt_2; m++){
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

    var total_row_cnt = 1;
    for(i in row_count_list){
        total_row_cnt = total_row_cnt * row_count_list[i];
    }

    var row_mapping_list = [];
    // prepare row_mapping_list(columns)
    for(var i = 0; i < total_row_cnt; i ++){
        row_mapping_list.push([]);
    }

    for (var i in row_count_list){
        var cnt = 0;

        // i를 기준으로 후위 필드 cnt
        var row_cnt_1 = 1;
        for(var j = Number(i) + 1; j < row_count_list.length; j ++){
            row_cnt_1 = row_cnt_1 * row_count_list[j];
        }

        // i를 기준으로 전위 필드 cnt
        var count_list_2 = $.extend(true, [], row_count_list);
        count_list_2 = count_list_2.splice(0, i)
        var row_cnt_2 = 1;
        for(var j in count_list_2){
            row_cnt_2 = row_cnt_2 * count_list_2[j];
        }

        // columns 기준으로 cell 값 넣기
        for(var m = 0; m < row_cnt_2; m++){
            for(var j in row_list[i]){
                for (var l = 0; l < row_cnt_1; l ++){
                    row_mapping_list[cnt].push(row_list[i][j])
                    cnt++;
                }
            }
        }
    }

    for (var i in row_mapping_list){
        var row_val = row_mapping_list[i]
        var c_list = []
        for (var j in col_mapping_list){
            var col_val = col_mapping_list[j]
            var add_val = row_val.concat(col_val);
            var str = "";
            for (var l in row_val){
                str += row_val[l] + "_";
            }
            for (var l in col_val){
                str += col_val[l] + "_";
            }
            str += row_val[0]
            c_list.push(str);
        }
        cell_mapping_list.push(c_list)
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
        // var qry = "SELECT DISTINCT("+field_list[i]+") as distinct_field from ? ";
        var qry = "SELECT DISTINCT("+field_list[i]+") as distinct_field from ? order by " + field_list[i];
        var data = alasql(qry, [parameter]);
        for (var i in data){
            d_list.push(data[i]['distinct_field'])
        }
        distinct_list.push(d_list);
    }
    return distinct_list;
}

var drawPivotTable = function(row_list, col_list, aggregation_field, mapping_cell, row_field, col_field){
    // Draw Table
    var title_row = 0;
    var title_col = 0;

    for(var i in row_list)
        title_row += 1;

    for(var i in col_list)
        title_col += 1;

    if(aggregation_field.length !== 0)
        title_col += 1;

    var html = '<table id="pivot" style="width:100%">'
    html += '<thead>'
    for(var i in col_list){
        html += '<tr>'

        if(Number(i) === 0){
            html += '<th colspan="'+ (title_row) +'" rowspan="'+(title_col-1)+'"></th>'
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
                    var val = col_list[i][j]
                    html += '<th colspan="'+colspan_cnt*(aggregation_field.length)+'">'+val+'</th>'
                }
            }
        }else{
            for(var j in col_list[i]){
                var val = col_list[i][j]
                html += '<th colspan="'+colspan_cnt*(aggregation_field.length)+'">'+val+'</th>'
            }
        }

        if(Number(i) === 0){
            html += '<th rowspan="'+(title_col)+'">Total: </th>'
        }

        html += '</tr>'
    }
    // aggregation
    html += '<tr>'

    var aggregation_cnt = 1;
    for(i in col_list){
        aggregation_cnt = aggregation_cnt * col_list[i].length;
    }

    for (var j in row_field){
        html += '<th>' + row_field[j] + '</th>'
    }
    for(var j = 0; j < aggregation_cnt; j++){
        for(var i in aggregation_field){
            html += '<th>'+aggregation_field[i].calculate + ' of ' + aggregation_field[i].field+'</th>'
        }
    }

    html += '</tr>'
    html += '</thead>'
    html += '<tbody>'
    // data_set

    var rowspan_list = getRowspan(row_list, mapping_cell);

    for (var i in mapping_cell){
        html += '<tr>'
        for (var j in rowspan_list[i]){
            html += '<td>'+rowspan_list[i][j]+'</td>'
        }
        for (var j in mapping_cell[i]){
            html += '<td id="'+mapping_cell[i][j]+'">'
            html += '</td>'
        }
        html += '<td id="row_total_'+i+'"></td>'
        html += '</tr>'
    }

    html += '</tbody>'
    html += '<tfoot id="pivot_footer">'
    var cell_count = row_field.length + mapping_cell[0].length;
    html += '<tr>'
    html += '<th colspan="'+row_field.length+'">Total : </th>'
    for (var i = row_field.length; i < cell_count + 1; i++){
        html += '<th></th>'
    }
    html += '</tr>'
    html += '</tfoot>'
    html += '</table>'

    return html;
}


var getRowspan = function(row_field, mapping){
    var row_cnt =[]
    for (var i = 0; i < row_field.length; i++){
        var sum = 1;
        for (var j = i+1; j < row_field.length; j++){
            sum *= row_field[j].length;
        }
        row_cnt.push(sum);
    }

    var row_list = [];
    for (var i in mapping){
        row_list.push([]);
    }

    for (var i in row_cnt){
        if (row_cnt[i] !== 1){
            for (var j = 0; j < mapping.length; j++){
                if (j%row_cnt[i] === 0){
                    if (j === 0)
                        row_list[0].push(row_cnt[i])
                    else
                        row_list[j].push(row_cnt[i])
                }
            }
        }else{
            for (var j = 0; j < mapping.length; j++){
                row_list[j].push(1);
            }
        }
    }

    // row count list
    var row_count_list = [];
    for(var i in row_field){
        row_count_list.push(row_field[i].length);
    }

    var total_row_cnt = 1;
    for(i in row_count_list){
        total_row_cnt = total_row_cnt * row_count_list[i];
    }

    var row_mapping_list = [];
    // prepare row_mapping_list(columns)
    for(var i = 0; i < total_row_cnt; i ++){
        row_mapping_list.push([]);
    }

    for (var i in row_count_list){
        var cnt = 0;

        // i를 기준으로 후위 필드 cnt
        var row_cnt_1 = 1;
        for(var j = Number(i) + 1; j < row_count_list.length; j ++){
            row_cnt_1 = row_cnt_1 * row_count_list[j];
        }

        // i를 기준으로 전위 필드 cnt
        var count_list_2 = $.extend(true, [], row_count_list);
        count_list_2 = count_list_2.splice(0, i)
        var row_cnt_2 = 1;
        for(var j in count_list_2){
            row_cnt_2 = row_cnt_2 * count_list_2[j];
        }

        // columns 기준으로 cell 값 넣기
        for(var m = 0; m < row_cnt_2; m++){
            for(var j in row_field[i]){
                for (var l = 0; l < row_cnt_1; l ++){
                    row_mapping_list[cnt].push(row_field[i][j])
                    cnt++;
                }
            }
        }
    }

    return row_mapping_list;
}

// 숫자 값 확인
var intVal = function ( i ) {
    return typeof i === 'string' ?
        i.replace(/[\$,]/g, '')*1 :
        typeof i === 'number' ?
            i : 0;
};
