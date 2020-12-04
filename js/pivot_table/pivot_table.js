// Pivot Table 구성
// 값이 들어가지는 않고 틀만 생성
// 추후 pivot 값을 통해서 해당 필드에 넣어 줘야 함
var drawPivotTable = function (table, row_field_list, col_field_list, aggregation_list, mapping_cell, result_list) {
    var row_field = [];
    var col_field = [];

    for (var i in chart_pivot_list.rows)
        row_field.push(chart_pivot_list.rows[i].name);

    for (var i in chart_pivot_list.columns)
        col_field.push(chart_pivot_list.columns[i].name);

    // Draw Table
    var title_row = 0;
    var title_col = 0;

    for (var i in row_list)
        title_row += 1;

    for (var i in col_list)
        title_col += 1;

    if (aggregation_field.length !== 0)
        title_col += 1;

    var html = '<table class="table table-bordered table-nowrap text-center" id="' + table + '_pivot" style="width:100%">';
    html += '<thead>';
    for (var i in col_list) {
        html += '<tr>';

        if (Number(i) === 0) {
            html += '<th class="table_columns_header" colspan="' + (title_row) + '" rowspan="' + (title_col - 1) + '" style="white-space: nowrap"></th>'
        }

        var colspan_cnt = 1;
        for (j = Number(i) + 1; j < col_list.length; j++) {
            colspan_cnt = colspan_cnt * (col_list[j].length)
        }

        if (Number(i) !== 0) {
            var col_cnt = 1;
            for (var l = 0; l < i; l++) {
                col_cnt = col_cnt * col_list[l].length;
            }
            for (var l = 1; l <= col_cnt; l++) {
                for (var j in col_list[i]) {
                    var val = col_list[i][j];
                    html += '<th class="table_columns_header" colspan="' + colspan_cnt * (aggregation_field.length) + '" style="white-space: nowrap">' + val + '</th>'
                }
            }
        } else {
            for (var j in col_list[i]) {
                var val = col_list[i][j];
                html += '<th class="table_columns_header" colspan="' + colspan_cnt * (aggregation_field.length) + '" style="white-space: nowrap">' + val + '</th>'
            }
        }
        if (type !== 'raw') {
            if (Number(i) === 0) {
                html += '<th class="table_columns_header" rowspan="' + (title_col - 1) + '" colspan="' + (aggregation_field.length) + '" style="white-space: nowrap">Total: </th>'
            }
        }

        html += '</tr>'
    }
    // aggregation
    html += '<tr>';

    var aggregation_cnt = 1;
    var col_list_cnt = 1;
    if (!isEmpty(col_list))
        col_list_cnt = col_list[0].length;
    for (i in col_list) {
        aggregation_cnt = aggregation_cnt * col_list[i].length;
    }

    for (var j in row_field) {
        html += '<th class="table_aggregation_header" style="white-space: nowrap">' + row_field[j] + '</th>'
    }
    for (var j = 0; j < aggregation_cnt; j++) {
        for (var i in aggregation_field) {
            if (aggregation_field[i].name_change)
                html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_field[i].name + '</th>';
            else
                html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_field[i].type_cal + ' of ' + aggregation_field[i].key + '</th>'
        }
    }

    if (type !== 'raw'){
        if (isEmpty(col_list)){
            for (var i in aggregation_field){
                if (aggregation_field[i].name_change)
                    html += '<th class="table_aggregation_header" style="white-space: nowrap"> Total :' + aggregation_field[i].name + '</th>';
                else
                    html += '<th class="table_aggregation_header" style="white-space: nowrap"> Total : ' + aggregation_field[i].type_cal + ' of ' + aggregation_field[i].key + '</th>'
            }
        } else {
            for (var i in aggregation_field){
                if (aggregation_field[i].name_change)
                    html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_field[i].name + '</th>';
                else
                    html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_field[i].type_cal + ' of ' + aggregation_field[i].key + '</th>'
            }
        }
    }

    html += '</tr>';
    html += '</thead>';
    html += '<tbody class="text-right">';
    // data_set
    var pivot_row = chart_pivot_list.rows;

    var row_cnt = 0;
    if (!isEmpty(row_list))
        row_cnt = row_list.length;

    var mapping_cnt = 0;
    if (!isEmpty(mapping_cell))
        mapping_cnt = mapping_cell[0].length;
    for (var i in mapping_cell) {
        html += '<tr>';

        for (var j = 0; j < row_cnt; j ++) {
            var val = mapping_cell[i][j];
            if (pivot_row[j].type === 'date')
                val = setDateTypeDetail(val, pivot_row[j].type_detail);
            html += '<td class="text-left">' + val + '</td>'
        }

        for (var j=0; j < mapping_cnt - row_cnt; j++) {
            html += '<td id="' + table + '_row' + i + '_col' + j + '">';
            html += '</td>'
        }
        if (type !== 'raw') {
            for (var j in aggregation_field)
                html += '<td id= "' + table + '_row_total_' + j + '_' + i + '"></td>';
        }

        html += '</tr>'
    }

    html += '</tbody>';
    if (type !== 'raw') {
        html += '<tfoot id="' + table + '_pivot_footer">';
        var mapping_cell_count = 0;
        if (!isEmpty(mapping_cell))
            mapping_cell_count = mapping_cell[0].length;
        var row_field_cnt = 0;
        if (!isEmpty(row_field))
            row_field_cnt = row_field.length;
        var agg_field_cnt = 0;
        if (!isEmpty(aggregation_field))
            agg_field_cnt = aggregation_field.length;
        var cell_count = mapping_cell_count - row_field_cnt + agg_field_cnt;
        html += '<tr>';
        html += '<th colspan="' + row_field.length + '">Total : </th>';
        for (var i = 0; i < cell_count ; i++) {
            html += '<th></th>'
        }
        html += '</tr>';
        html += '</tfoot>';
    }

    html += '</table>';
    return html;
};



// Pivot table settings
var setPivotTable = async function (table, type, isDraw, data_list, row_list, col_list, aggregation_list) {
    setTimeout(() => {
        setPivotTableRun(table, type, isDraw, data_list, row_list, col_list, aggregation_list);
    }, 100);
};

function setPivotTableRun(table, type, isDraw, data_list, row_list, col_list, aggregation_list) {
    // var pivot_list = $.extend(true, [], origin_list);
    // var row_field = $.extend(true, [], row_list);
    // var col_field = $.extend(true, [], col_list);
    // var aggregation_field = $.extend(true, [], aggregation_list);

    // pivot cell 에 넣을 data
    let result_list = getPivotQry(row_list, col_list, aggregation_list, data_list);

    // pivot row 의 distinct data // 기존
    let row_field_list = getDistinctQry(row_list, data_list);

    // pivot column 의 distinct data // 기존
    let col_field_list = getDistinctQry(col_list, data_list);


    // pivot column 의 개수
    let cnt_col = getListLength(aggregation_list);
    for (var i in col_field_list)
        cnt_col *= getListLength(col_field_list[i]);

    // pivot rows 의 개수
    let cnt_row = 1;
    for (var i in row_field_list)
        cnt_row *= getListLength(row_field_list[i]);

    // 참고 하지 않음 삭제 예정
    // let mapping_row = [];
    // for (var i = 0; i < cnt_row; i++)
    //     mapping_row.push([]);

    // pivot mapping cell
    let mapping_result_cnt = setCellMapping(table, row_field_list, col_field_list, aggregation_list, result_list);

    let mapping_cell = mapping_result_cnt.cell_mapping_list;

    let row_mapping_list = mapping_result_cnt.row_mapping_list;

    let col_mapping_list = mapping_result_cnt.col_mapping_list;

    // Draw pivot table
    let html = drawPivotTable(table, row_field_list, col_field_list, aggregation_list, mapping_cell, result_list);

    // $('#' + table).html(null);
    // $('#' + table).html(html);
    //
    // // var table_html = "<table id = '" + table + "_pivot'></table>";
    // // $('#' + table).html(table_html);
    //
    // for (var i in result_list) {
    //     var last_cnt = row_field.length + col_field.length;
    //     for (var j in result_list[i]) {
    //         var str = "";
    //         var cur_cnt = 0;
    //         var cell_val = "";
    //         var row_cnt = row_list.length;
    //         var r_list = [];
    //         var c_list = [];
    //         $.each(result_list[i][j], function (key, value) {
    //             if (cur_cnt < row_cnt) {
    //                 r_list.push(value);
    //             } else {
    //                 if (cur_cnt === last_cnt) {
    //                     c_list.push(key);
    //                     cell_val = value;
    //                 } else
    //                     c_list.push(value)
    //             }
    //             cur_cnt++;
    //         });
    //         var r_idx = row_mapping_list.findIndex((item, idx) => {
    //             return JSON.stringify(item) === JSON.stringify(r_list);
    //         });
    //         var c_idx = col_mapping_list.findIndex((item, idx) => {
    //             return JSON.stringify(item) === JSON.stringify(c_list);
    //         });
    //         str = "row" + r_idx + "_col" + c_idx;
    //
    //         $("#" + table + "_" + str).html(cell_val);
    //     }
    // }
    //
    // var row_total_list = [];
    // for (var i in mapping_cell) {
    //     var row_total = [];
    //     for (var j in aggregation_field)
    //         row_total.push(0);
    //     for (var j in mapping_cell[i]) {
    //         var row_total_field = Number(j) % aggregation_field.length;
    //         row_total[row_total_field] = row_total[row_total_field] + Number($("#" + table + "_row" + i + "_col" + j).text())
    //     }
    //     row_total_list.push(row_total);
    //     for (var j in aggregation_field) {
    //         $("#" + table + "_row_total_" + j + "_" + i).html(row_total[Number(j)])
    //     }
    // }
    //
    // var row_group_list = [];
    // for (var i in row_field) {
    //     row_group_list.push(i)
    // }
    //
    // var mapping_cell_cnt = 0;
    // if (!isEmpty(mapping_cell))
    //     mapping_cell_cnt = mapping_cell[0].length;
    //
    //
    // if (type === 'raw') {
    //     var raw_table = $("#" + table + "_pivot").DataTable({
    //         destroy: true,
    //         searching: false,
    //         paging: true,
    //         lengthChange: true,
    //         lengthMenu: [10, 25, 50, 100, 250, 500, 1000],
    //         pageLength: chart_pivot_style.pivot_current_row_num,
    //         info: false,
    //         ordering: false,
    //         columnDefs: [{
    //             render: function (data, type, row) {
    //                 var sum = 0;
    //                 for (var j = row_field.length; j < mapping_cell[0].length + row_field.length - 1; j++) {
    //                     sum = sum + intVal(row[j]);
    //                 }
    //                 return sum
    //             },
    //         }],
    //         drawCallback: function (settings) {
    //             var api = this.api();
    //             var delete_columns = [];
    //             var cell_count = mapping_cell_cnt;
    //             for (var i = row_field.length; i < cell_count; i++) {
    //                 var exist_columns = false;
    //                 var sum_col = api
    //                     .column(i)
    //                     .data()
    //                     .reduce(function (a, b) {
    //                         if (!isEmpty(b))
    //                             exist_columns = true;
    //                         return intVal(a) + intVal(b);
    //                     }, 0);
    //                 if (!exist_columns)
    //                     delete_columns.push(i);
    //             }
    //             this.api().columns(delete_columns).visible(false);
    //             $("#loading").removeClass("loading_spin");
    //         },
    //         createdRow: function (row, data, dataIndex) {
    //             var row_cnt = 0;
    //             if (!isEmpty(row_list))
    //                 row_cnt = row_list.length;
    //             var col_cnt = 1;
    //             for (var i in col_list) {
    //                 if (!isEmpty(col_list[i]))
    //                     col_cnt *= col_list[i].length;
    //             }
    //             if (!isEmpty(aggregation_field))
    //                 col_cnt *= aggregation_field.length;
    //             var check = true;
    //             for (var i = row_cnt; i < (row_cnt + col_cnt); i++) {
    //                 if (!isEmpty(data[i])) {
    //                     check = false;
    //                     break;
    //                 }
    //             }
    //             if (check)
    //                 this.api().row(row).remove();
    //         }
    //     });
    // } else {
    //     var delete_columns = [];
    //     $("#loading").removeClass("loading_spin");
    //     var result_table = $("#" + table + "_pivot").DataTable({
    //         destroy: true,
    //         searching: false,
    //         paging: true,
    //         lengthChange: true,
    //         lengthMenu: [10, 25, 50, 100, 250, 500, 1000],
    //         pageLength: chart_pivot_style.pivot_current_row_num,
    //         info: false,
    //         ordering: false,
    //         rowsGroup: row_group_list,
    //         drawCallback: function (settings) {
    //             console.log("drawCallback")
    //             if (Number(settings._iDisplayLength) !== chart_pivot_style.pivot_current_row_num) {
    //                 // check
    //                 $("#pivot_row_num").val(Number(settings._iDisplayLength));
    //                 $("#pivot_row_num").trigger("change");
    //             }
    //
    //             var api = this.api();
    //             var rows = api.rows({page: 'all'}).nodes();
    //             var last = null;
    //
    //             var title_cnt = (row_field.length);
    //             var data_cnt = mapping_cell_cnt;
    //
    //             // Remove the formatting to get integer data for summation
    //             var total = [];
    //             var view_cnt = data_cnt + aggregation_field.length;
    //             if (!chart_pivot_style.pivot_row_total) {
    //                 view_cnt = view_cnt - aggregation_field.length;
    //             }
    //             $.each(api.column(0, {page: 'all'}).data(), function (i, group) {
    //                 var group_assoc = group.replace(' ', "_");
    //                 if (typeof total[group_assoc] != 'undefined') {
    //                     for (var j = 0; j < view_cnt-row_cnt; j++) {
    //                         var cell_data = api.column(j + title_cnt).data()[i];
    //                         var pre_data = total[group_assoc][j];
    //                         var cell_cnt = 0;
    //                         var sum_data = '';
    //                         if (!isEmpty(cell_data.split(".")[1]))
    //                             cell_cnt = cell_data.split(".")[1].length;
    //                         if (!isEmpty(cell_data)) {
    //                             cell_data = Number(cell_data.replace(/%/gi, '').replace(/,/gi, ''));
    //                             sum_data = pre_data + cell_data;
    //                         } else if (!isEmpty(pre_data)) {
    //                             sum_data = pre_data;
    //                         }
    //                         if (isEmpty(sum_data))
    //                             total[group_assoc][j] = sum_data;
    //                         else
    //                             total[group_assoc][j] = Number(sum_data);
    //                     }
    //                 } else {
    //                     var row_data = [];
    //                     for (var j = 0; j < view_cnt-row_cnt; j++) {
    //                         var cell_cnt = 0;
    //                         var cell_data = api.column(Number(j) + Number(title_cnt)).data()[i];
    //                         if (!isEmpty(cell_data)) {
    //                             if (!isEmpty(cell_data.split(".")[1]))
    //                                 cell_cnt = cell_data.split(".")[1].length;
    //                             cell_data = cell_data.replace(/%/gi, '').replace(/,/gi, '');
    //                         }
    //                         if (isEmpty(cell_data))
    //                             row_data.push(cell_data);
    //                         else
    //                             row_data.push(Number(cell_data));
    //                     }
    //                     total[group_assoc] = $.extend(true, [], row_data);
    //                 }
    //             });
    //             $.each(api.column(0, {page: 'all'}).data(), function (i, group) {
    //                 var group_assoc = group.replace(' ', "_");
    //                 if (last !== group) {
    //                     var html = '<tr class="group">';
    //                     html += '<td colspan="' + title_cnt + '">' + group_assoc + ' Total : </td>';
    //                     var row_list = $.extend(true, [], total[group_assoc]);
    //                     var cell_cnt = data_cnt;
    //                     var aggregation_length = aggregation_field.length;
    //
    //                     var view_cnt = cell_cnt + aggregation_field.length;
    //                     if (!chart_pivot_style.pivot_row_total) {
    //                         view_cnt = view_cnt - aggregation_field.length;
    //                     }
    //
    //                     for (var j = 0; j < view_cnt-row_cnt; j++) {
    //                         if (!(delete_columns.indexOf(Number(j) + Number(title_cnt)) > -1)) {
    //                             var agg_cnt = j % aggregation_length;
    //                             var agg = aggregation_field[agg_cnt];
    //                             var cell_val = row_list[j];
    //                             if (!isEmpty(cell_val)) {
    //                                 if (agg.type_detail === 'percentage') {
    //                                     cell_val = numberWithCommas((Number(cell_val) * 100).toFixed(2)) + "%";
    //                                 } else if (agg.type_detail === 'point_zero') {
    //                                     cell_val = numberWithCommas(Math.round(Number(cell_val)));
    //                                 } else if (agg.type_detail === 'point_one') {
    //                                     cell_val = numberWithCommas((Number(cell_val)).toFixed(1));
    //                                 } else if (agg.type_detail === 'point_two') {
    //                                     cell_val = numberWithCommas((Number(cell_val)).toFixed(2));
    //                                 } else if (agg.type_detail === 'won') {
    //                                     cell_val = "₩ " + numberWithCommas(Math.round(Number(cell_val)));
    //                                 } else {
    //                                     cell_val = numberWithCommas(Math.round((Number(cell_val) + Number.EPSILON) * 100) / 100);
    //                                 }
    //                             }
    //                             html += '<td>' + cell_val + '</td>'
    //                         }
    //                     }
    //                     html += '</tr>';
    //                     $(rows).eq(i).before(html);
    //                     last = group;
    //                 }
    //             });
    //
    //             var cell_count = mapping_cell_cnt;
    //             if (!chart_pivot_style.pivot_row_total){
    //                 for (var i = cell_count; i < cell_count + aggregation_field.length; i++)
    //                     delete_columns.push(i)
    //             }
    //             this.api().columns().visible(true);
    //             this.api().columns(delete_columns).visible(false);
    //
    //             if (chart_pivot_style.pivot_sub_total) {
    //                 $(".group").show();
    //             } else {
    //                 $(".group").hide();
    //             }
    //             console.log("loading ends")
    //             // viewer.jsp 에서 화면 로딩 완료 식별을 위한 분기
    //             gRenderCompleteFlag = true;
    //             $("#loading").removeClass("loading_spin");
    //         },
    //         footerCallback: function (row, data, start, end, display) {
    //             $("#loading").removeClass("loading_spin");
    //             var api = this.api(), data;
    //             var aggregation_cnt = 0;
    //             if (!isEmpty(aggregation_field))
    //                 aggregation_cnt = aggregation_field.length;
    //             var cell_count = mapping_cell_cnt + aggregation_cnt;
    //             delete_columns = [];
    //             for (var i = row_field.length; i < cell_count; i++) {
    //                 var cell_cnt = 0;
    //                 var exist_columns = false;
    //                 var sum_col = api
    //                     .column(i)
    //                     .data()
    //                     .reduce(function (a, b) {
    //                         if (!isEmpty(b)) {
    //                             var cell_split = b.split('.')[1];
    //                             if (!isEmpty(cell_split))
    //                                 cell_cnt = b.split('.')[1].length;
    //                             if (!isEmpty(b))
    //                                 exist_columns = true;
    //                         }
    //                         b = b.replace(/%/gi, '').replace(/,/gi, '');
    //                         return Number(a) + Number(b);
    //                     }, 0);
    //                 if (!exist_columns)
    //                     delete_columns.push(i);
    //
    //                 var agg = aggregation_field[i % aggregation_cnt];
    //                 if (!isEmpty(cell_val)) {
    //                     if (agg.type_detail === 'percentage') {
    //                         sum_col = numberWithCommas((Number(sum_col) * 100).toFixed(2)) + "%";
    //                     } else if (agg.type_detail === 'point_zero') {
    //                         sum_col = numberWithCommas(Math.round(Number(sum_col)));
    //                     } else if (agg.type_detail === 'point_one') {
    //                         sum_col = numberWithCommas((Number(sum_col)).toFixed(1));
    //                     } else if (agg.type_detail === 'point_two') {
    //                         sum_col = numberWithCommas((Number(sum_col)).toFixed(2));
    //                     } else if (agg.type_detail === 'won') {
    //                         sum_col = "₩ " + numberWithCommas(Math.round(Number(sum_col)));
    //                     } else {
    //                         sum_col = numberWithCommas(Math.round((Number(sum_col) + Number.EPSILON) * 100) / 100);
    //                     }
    //                 }
    //                 $(api.column(i).footer()).html(sum_col);
    //             }
    //         },
    //         createdRow: function (row, data, dataIndex) {
    //             var row_cnt = 0;
    //             if (!isEmpty(row_list))
    //                 row_cnt = row_list.length;
    //             var col_cnt = 1;
    //             for (var i in col_list) {
    //                 if (!isEmpty(col_list[i]))
    //                     col_cnt *= col_list[i].length;
    //             }
    //             if (!isEmpty(aggregation_field))
    //                 col_cnt *= aggregation_field.length;
    //
    //             if (chart_pivot_style.pivot_row_total)
    //                 col_cnt += aggregation_field.length;
    //             var check = true;
    //             for (var i = row_cnt; i < (row_cnt + col_cnt); i++) {
    //                 if (chart_pivot_style.pivot_row_total) {
    //                     if (i < (row_cnt + col_cnt - aggregation_field.length) && !isEmpty(data[i]))
    //                         check = false;
    //                 } else {
    //                     if (!isEmpty(data[i]))
    //                         check = false;
    //                 }
    //                 var agg = aggregation_field[(i - row_cnt) % aggregation_field.length];
    //                 var cell_val = data[i];
    //                 if (!isEmpty(cell_val)) {
    //                     var check_cnt = row_cnt + col_cnt;
    //
    //                     if (chart_pivot_style.pivot_row_total)
    //                         check_cnt = check_cnt - aggregation_field.length;
    //                     if (i < (check_cnt)) {
    //                         var style = setConditionTable(Number(cell_val), agg);
    //                         $('td:eq(' + (Number(i)) + ')', row).addClass("text-right");
    //                         $('td:eq(' + (Number(i)) + ')', row).css(style);
    //                     } else {
    //                         var style = {
    //                             'font-weight': 'bold'
    //                         };
    //                         $('td:eq(' + (Number(i)) + ')', row).addClass("text-right");
    //                         $('td:eq(' + (Number(i)) + ')', row).css(style);
    //                     }
    //
    //                     if (agg.type_detail === 'percentage') {
    //                         cell_val = numberWithCommas((Number(cell_val) * 100).toFixed(2)) + "%";
    //                     } else if (agg.type_detail === 'point_zero') {
    //                         cell_val = numberWithCommas(Math.round(Number(cell_val)));
    //                     } else if (agg.type_detail === 'point_one') {
    //                         cell_val = numberWithCommas((Number(cell_val)).toFixed(1));
    //                     } else if (agg.type_detail === 'point_two') {
    //                         cell_val = numberWithCommas((Number(cell_val)).toFixed(2));
    //                     } else if (agg.type_detail === 'won') {
    //                         cell_val = "₩ " + numberWithCommas(Math.round(Number(cell_val)));
    //                     } else {
    //                         cell_val = numberWithCommas(Math.round((Number(cell_val) + Number.EPSILON) * 100) / 100);
    //                     }
    //                 }
    //                 $('td:eq(' + Number(i) + ')', row).html(cell_val);
    //             }
    //         }
    //     });
    //     if (chart_pivot_style.pivot_column_total) {
    //         $('#' + table + '_pivot_footer').show();
    //     } else {
    //         $('#' + table + '_pivot_footer').hide();
    //     }
    // }

}

// pivot table cell mapping 리스트 설정
const setCellMapping = function (table, row_field_list, col_field_list, aggregation_list, result_list) {
    // column count list
    let col_count_list = [];
    for (let i in col_field_list) {
        col_count_list.push(getListLength(col_field_list[i]));
    }
    col_count_list.push(getListLength(aggregation_list));

    // row count list
    let row_count_list = [];
    for (let i in row_field_list) {
        row_count_list.push(getListLength(row_field_list[i]));
    }

    // total columns count
    let total_col_cnt = 1;
    for (i in col_count_list) {
        total_col_cnt = total_col_cnt * col_count_list[i];
    }

    // prepare col_mapping_list(columns)
    let col_mapping_list = [];
    for (let i = 0; i < total_col_cnt; i++) {
        col_mapping_list.push([]);
    }

    // prepare pivot column cell
    // pivot column 전체 조건의 리스트 (Header 에 들어갈 데이터)
    for (let i in col_count_list) {
        let cnt = 0;
        // i를 기준으로 후위 필드 cnt
        let col_cnt_1 = 1;
        for (let j = Number(i) + 1; j < getListLength(col_count_list); j++) {
            col_cnt_1 = col_cnt_1 * col_count_list[j];
        }

        // i를 기준으로 전위 필드 cnt
        let count_list_2 = $.extend(true, [], col_count_list);
        count_list_2 = count_list_2.splice(0, i);
        let col_cnt_2 = 1;
        for (let j in count_list_2) {
            col_cnt_2 = col_cnt_2 * count_list_2[j];
        }

        // columns 기준으로 cell 값 넣기
        if (Number(i) !== getListLength(col_count_list) - 1) {
            for (let m = 0; m < col_cnt_2; m++) {
                for (let j in col_field_list[i]) {
                    for (let l = 0; l < col_cnt_1; l++) {
                        col_mapping_list[cnt].push(col_field_list[i][j]);
                        cnt++;
                    }
                }
            }
        } else {
            for (let j = 0; j < total_col_cnt / getListLength(aggregation_list); j++) {
                for (let i in aggregation_list) {
                    col_mapping_list[cnt].push(aggregation_list[i].calculate + '_' + aggregation_list[i].key);
                    cnt++;
                }
            }
        }
    }

    // get total row count
    let total_row_cnt = 1;
    for (i in row_count_list) {
        total_row_cnt = total_row_cnt * row_count_list[i];
    }

    // prepare row_mapping_list(rows)
    let row_mapping_list = [];
    for (let i = 0; i < total_row_cnt; i++) {
        row_mapping_list.push([]);
    }

    // prepare pivot row cell
    // pivot row 전체 조건의 리스트 (pivot row 의 이름에 들어갈 데이터)
    for (let i in row_count_list) {
        let cnt = 0;

        // i를 기준으로 후위 필드 cnt
        let row_cnt_1 = 1;
        for (let j = Number(i) + 1; j < getListLength(row_count_list); j++) {
            row_cnt_1 = row_cnt_1 * row_count_list[j];
        }

        // i를 기준으로 전위 필드 cnt
        let count_list_2 = $.extend(true, [], row_count_list);
        count_list_2 = count_list_2.splice(0, i);
        let row_cnt_2 = 1;
        for (let j in count_list_2) {
            row_cnt_2 = row_cnt_2 * count_list_2[j];
        }

        // rows 기준으로 cell 값 넣기
        for (let m = 0; m < row_cnt_2; m++) {
            for (let j in row_field_list[i]) {
                for (let l = 0; l < row_cnt_1; l++) {
                    row_mapping_list[cnt].push(row_field_list[Number(i)][j]);
                    cnt++;
                }
            }
        }
    }

    // mapping 가능하도록 전체 cell 의 리스트
    let mapping_result = [];
    for (let i in row_mapping_list){
        let row = $.extend(true, [], row_mapping_list[i]);
        for (let j in col_mapping_list){
            let str = "";
            for (let k in col_mapping_list[j]){
                str += col_mapping_list[j][k];
                if (Number(k) < col_mapping_list[j].length - 1)
                    str += '_';
            }
            row.push(str);
        }
        mapping_result.push(row);
    }

    // mapping_result 에서 숫자를 줄여볼까?

    // 사용하는 row 의 index 번호를 가져와야함
    // 값이 없어도 경우의 수 전체를 리스트로 만들기 때문에 행의 수를 줄이기 위해서 사용하는 리스트만 가져와야 함
    let last_cnt = getListLength(row_field_list) + getListLength(col_field_list);
    let use_list = [];
    for (let i in result_list) {
        for (let j in result_list[i]) {
            let cur_cnt = 0;
            let cell_val = "";
            let row_cnt = getListLength(row_field_list);
            let r_list = [];
            let c_list = [];
            $.each(result_list[i][j], function (key, value) {
                // console.log("cur_cnt: " + cur_cnt + " row_cnt: " + row_cnt)
                if (cur_cnt < row_cnt) {
                    r_list.push(value);
                } else {
                    if (cur_cnt === last_cnt) {
                        c_list.push(key);
                        cell_val = value;
                    } else
                        c_list.push(value)
                }
                cur_cnt++;
            });

            let str = '';
            for(let k in c_list){
                str += c_list[k];
                if (Number(k) < getListLength(c_list) - 1)
                    str += '_';
            }

            r_list.push(str)

            for (let k in mapping_result){
                let checkRole = intersect(mapping_result[k], r_list);
                if (compareArrays(checkRole, r_list)){
                    if ($.inArray(Number(k), use_list) === -1) use_list.push(Number(k));
                }
            }
        }
    }

    // 사용하는 행의 리스트를 정렬함
    use_list.sort(function(a, b)  {
        if(a > b) return 1;
        if(a === b) return 0;
        if(a < b) return -1;
    });

    // 사용하는 row 들만 가지고 와서 result_mapping_list 리스트에 추가
    let result_mapping_list = [];
    let result_row_list = [];
    for (let i in use_list){
        result_mapping_list.push($.extend(true, [], mapping_result[use_list[i]]));
        result_row_list.push($.extend(true, [], row_mapping_list[use_list[i]]));
    }

    return {
        "col_mapping_list": col_mapping_list,
        "row_mapping_list": result_row_list,
        "cell_mapping_list": result_mapping_list
    };
};

//
// var drawPivotTable = function(row_list, col_list, aggregation_field, mapping_cell, row_field, col_field){
//     // Draw Table
//     var title_row = 0;
//     var title_col = 0;
//
//     for(var i in row_list)
//         title_row += 1;
//
//     for(var i in col_list)
//         title_col += 1;
//
//     if(aggregation_field.length !== 0)
//         title_col += 1;
//
//     var html = '<table id="pivot" style="width:100%">'
//     html += '<thead>'
//     for(var i in col_list){
//         html += '<tr>'
//
//         if(Number(i) === 0){
//             html += '<th colspan="'+ (title_row) +'" rowspan="'+(title_col-1)+'"></th>'
//         }
//
//         var colspan_cnt = 1;
//         for(j = Number(i)+1; j < col_list.length; j++){
//             colspan_cnt = colspan_cnt*(col_list[j].length)
//         }
//
//         if(Number(i) !== 0){
//             var col_cnt = 1;
//             for(var l = 0; l < i; l ++){
//                 col_cnt = col_cnt * col_list[l].length;
//             }
//             for(var l = 1; l <= col_cnt; l++){
//                 for(var j in col_list[i]){
//                     var val = col_list[i][j]
//                     html += '<th colspan="'+colspan_cnt*(aggregation_field.length)+'">'+val+'</th>'
//                 }
//             }
//         }else{
//             for(var j in col_list[i]){
//                 var val = col_list[i][j]
//                 html += '<th colspan="'+colspan_cnt*(aggregation_field.length)+'">'+val+'</th>'
//             }
//         }
//
//         if(Number(i) === 0){
//             html += '<th rowspan="'+(title_col)+'">Total: </th>'
//         }
//
//         html += '</tr>'
//     }
//     // aggregation
//     html += '<tr>'
//
//     var aggregation_cnt = 1;
//     for(i in col_list){
//         aggregation_cnt = aggregation_cnt * col_list[i].length;
//     }
//
//     for (var j in row_field){
//         html += '<th>' + row_field[j] + '</th>'
//     }
//     for(var j = 0; j < aggregation_cnt; j++){
//         for(var i in aggregation_field){
//             html += '<th>'+aggregation_field[i].calculate + ' of ' + aggregation_field[i].field+'</th>'
//         }
//     }
//
//     html += '</tr>'
//     html += '</thead>'
//     html += '<tbody>'
//     // data_set
//
//     var rowspan_list = getRowspan(row_list, mapping_cell);
//
//     for (var i in mapping_cell){
//         html += '<tr>'
//         for (var j in rowspan_list[i]){
//             html += '<td>'+rowspan_list[i][j]+'</td>'
//         }
//         for (var j in mapping_cell[i]){
//             html += '<td id="'+mapping_cell[i][j]+'">'
//             html += '</td>'
//         }
//         html += '<td id="row_total_'+i+'"></td>'
//         html += '</tr>'
//     }
//
//     html += '</tbody>'
//     html += '<tfoot id="pivot_footer">'
//     var cell_count = row_field.length + mapping_cell[0].length;
//     html += '<tr>'
//     html += '<th colspan="'+row_field.length+'">Total : </th>'
//     for (var i = row_field.length; i < cell_count + 1; i++){
//         html += '<th></th>'
//     }
//     html += '</tr>'
//     html += '</tfoot>'
//     html += '</table>'
//
//     return html;
// }
//
//
// var getRowspan = function(row_field, mapping){
//     var row_cnt =[]
//     for (var i = 0; i < row_field.length; i++){
//         var sum = 1;
//         for (var j = i+1; j < row_field.length; j++){
//             sum *= row_field[j].length;
//         }
//         row_cnt.push(sum);
//     }
//
//     var row_list = [];
//     for (var i in mapping){
//         row_list.push([]);
//     }
//
//     for (var i in row_cnt){
//         if (row_cnt[i] !== 1){
//             for (var j = 0; j < mapping.length; j++){
//                 if (j%row_cnt[i] === 0){
//                     if (j === 0)
//                         row_list[0].push(row_cnt[i])
//                     else
//                         row_list[j].push(row_cnt[i])
//                 }
//             }
//         }else{
//             for (var j = 0; j < mapping.length; j++){
//                 row_list[j].push(1);
//             }
//         }
//     }
//
//     // row count list
//     var row_count_list = [];
//     for(var i in row_field){
//         row_count_list.push(row_field[i].length);
//     }
//
//     var total_row_cnt = 1;
//     for(i in row_count_list){
//         total_row_cnt = total_row_cnt * row_count_list[i];
//     }
//
//     var row_mapping_list = [];
//     // prepare row_mapping_list(columns)
//     for(var i = 0; i < total_row_cnt; i ++){
//         row_mapping_list.push([]);
//     }
//
//     for (var i in row_count_list){
//         var cnt = 0;
//
//         // i를 기준으로 후위 필드 cnt
//         var row_cnt_1 = 1;
//         for(var j = Number(i) + 1; j < row_count_list.length; j ++){
//             row_cnt_1 = row_cnt_1 * row_count_list[j];
//         }
//
//         // i를 기준으로 전위 필드 cnt
//         var count_list_2 = $.extend(true, [], row_count_list);
//         count_list_2 = count_list_2.splice(0, i)
//         var row_cnt_2 = 1;
//         for(var j in count_list_2){
//             row_cnt_2 = row_cnt_2 * count_list_2[j];
//         }
//
//         // columns 기준으로 cell 값 넣기
//         for(var m = 0; m < row_cnt_2; m++){
//             for(var j in row_field[i]){
//                 for (var l = 0; l < row_cnt_1; l ++){
//                     row_mapping_list[cnt].push(row_field[i][j])
//                     cnt++;
//                 }
//             }
//         }
//     }
//
//     return row_mapping_list;
// }
//
// // 숫자 값 확인
// var intVal = function ( i ) {
//     return typeof i === 'string' ?
//         i.replace(/[\$,]/g, '')*1 :
//         typeof i === 'number' ?
//             i : 0;
// };
//
//
// function getPivotTable(row_field, col_field, aggregation_field) {
//     // pivot cell 에 넣을 data
//     var result_list = getPivotQry(row_field, col_field, aggregation_field);
//
//     // pivot row 의 distinct data
//     var row_list = getDistinctQry(row_field);
//
//     // pivot column 의 distinct data
//     var col_list = getDistinctQry(col_field);
//
//     // pivot mapping cell
//     mapping_cell = setCellMapping(col_list, row_list, aggregation_field);
//
//     // Draw pivot table
//     // 현재까지는 Column Header 개발
//     var html = drawPivotTable(row_list, col_list, aggregation_field, mapping_cell, row_field, col_field)
//     $("#test").html(html);
//
//     console.log(html)
//     // set result data
//     for (var i in result_list){
//         for (var j in result_list[i]){
//             var str = "";
//             var last_cnt = row_field.length + col_field.length;
//             var cur_cnt = 0;
//             var cell_val = "";
//             $.each(result_list[i][j], function(key, value){
//                 if (cur_cnt === last_cnt){
//                     str += key;
//                     cell_val = value;
//                 }else{
//                     str += value + "_";
//                 }
//                 cur_cnt++;
//             });
//             $("#" + str).html(cell_val);
//         }
//     }
//
//     for (var i in mapping_cell){
//         var sum = 0;
//         for (var j in mapping_cell[i]){
//             sum = sum + intVal($("#"+mapping_cell[i][j]).text())
//         }
//         $("#row_total_"+i).html(sum);
//     }
//
//     var row_group_list = [];
//     for (var i in row_field){
//         row_group_list.push(i)
//     }
//
//     // set datatables
//     t = $("#pivot").DataTable({
//         searching: false,
//         paging: true,
//         lengthChange: true,
//         lengthMenu: [10, 25, 50, 100, 250, 500, 1000],
//         pageLength: 10,
//         info: false,
//         ordering: false,
//         columnDefs: [{
//             render: function (data, type, row) {
//                 var sum = 0;
//                 for (var j = row_field.length; j < mapping_cell[0].length + row_field.length -1; j++){
//                     sum = sum + intVal(row[j]);
//                 }
//                 return sum
//             },
//             targets: row_field.length + mapping_cell[0].length
//         }],
//         rowsGroup:row_group_list,
//         drawCallback: function (settings) {
//             var api = this.api();
//             var rows = api.rows( {page:'all'} ).nodes();
//             var last = null;
//
//             var title_cnt = (row_field.length);
//             var data_cnt = (mapping_cell[0].length);
//
//             // Remove the formatting to get integer data for summation
//             var total = [];
//
//             api.column(0, {page:'all'}).data().each(function (group, i) {
//                 var group_assoc = group.replace(' ', "_");
//
//                 if (typeof total[group_assoc] != 'undefined'){
//                     for (var j = 0; j < data_cnt + 1; j++){
//                         total[group_assoc][j] = total[group_assoc][j] + intVal(api.column(j + title_cnt).data()[i])
//                     }
//                 }else{
//                     var row_data = [];
//                     for (var j = 0; j < data_cnt + 1; j++){
//                         row_data.push(intVal(api.column(Number(j) + Number(title_cnt)).data()[i]))
//                     }
//                     total[group_assoc] = $.extend(true, [], row_data);
//                 }
//             });
//             api.column(0, {page:'all'}).data().each(function (group, i) {
//                 var group_assoc = group.replace(' ', "_");
//                 if (last !== group){
//                     var html = '<tr class="group">'
//                     html += '<td colspan="'+title_cnt+'">'+group_assoc+' Total : </td>'
//                     var row_list = $.extend(true, [], total[group_assoc]);
//                     var cell_cnt = data_cnt;
//                     if (row_total_chk)
//                         cell_cnt++;
//                     for (var j = 0; j < cell_cnt; j ++){
//                         html += '<td>'+row_list[j]+'</td>'
//                     }
//                     html += '</tr>'
//                     $(rows).eq(i).before(html);
//                     last = group;
//                 }
//             });
//             for (var key in total){
//                 $("." + key).html("$" + total[key]);
//             }
//         },
//         footerCallback: function(row, data, start, end, display){
//             var api = this.api(), data;
//             var cell_count = row_field.length + mapping_cell[0].length;
//             if (row_total_chk)
//                 cell_count++;
//             for (var i = 3; i < cell_count; i++){
//                 var sum_col = api
//                     .column(i)
//                     .data()
//                     .reduce(function (a, b) {
//                         return intVal(a) + intVal(b);
//                     }, 0);
//                 $(api.column(i).footer()).html(sum_col);
//             }
//         }
//     });
// }

function showFooter() {
    $('#pivot_footer').show();
}
function hideFooter() {
    $('#pivot_footer').hide();
}
function showRightSum() {
    row_total_chk = true;
    var total_cnt = row_field.length + mapping_cell[0].length;
    var column = t.column(total_cnt);
    column.visible(row_total_chk)
    t.draw();
}
function hideRightSum(){
    row_total_chk = false;
    var total_cnt = row_field.length + mapping_cell[0].length;
    console.log(total_cnt)
    var column = t.column(total_cnt);
    column.visible(row_total_chk)
    t.draw();
}
function showSubTotal() {
    $(".group").show();
}
function hideSubTotal() {
    $(".group").hide();
}
