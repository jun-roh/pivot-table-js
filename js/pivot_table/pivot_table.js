// Pivot table settings
const setPivotTable = async function (object) {
    setTimeout(() => {
        setPivotTableRun(object);
    }, 100);
};

const setPivotTableRun = function (object) {
    let target = object.target;
    let table = object.name;
    let type = object.type;
    let data_list = object.data.data_list;
    let pivot_list = {
        row_list: object.data.row_field,
        col_list: object.data.column_field,
        agg_list: object.data.aggregation_field
    };

    let pivot_style = object.style;

    // pivot row 의 distinct data
    let row_field_list = getDistinctQry(pivot_list.row_list, data_list);

    // pivot column 의 distinct data
    let col_field_list = getDistinctQry(pivot_list.col_list, data_list);

    // 열 제한이 있을 경우에 열 제한해서 list 정리
    if (pivot_style.column_limit.limit)
        col_field_list = $.extend(true, [], columnLimitList(col_field_list, pivot_list.agg_list, pivot_style.column_limit.limit_length));

    // pivot row field list 의 갯수
    let row_list_count = getListLength(row_field_list, false);

    // pivot column field list 의 갯수
    let col_list_count = getListLength(col_field_list, false);

    // pivot column field list 의 갯수
    let agg_list_count = getListLength(pivot_list.agg_list, false);

    // pivot cell 에 넣을 data
    let result_list = getPivotQry(pivot_list.row_list, pivot_list.col_list, pivot_list.agg_list, data_list, row_field_list, col_field_list);

    // pivot column 의 개수
    let cnt_col = getListLength(pivot_list.agg_list, true);
    for (let i in col_field_list)
        cnt_col *= getListLength(col_field_list[i], true);

    // pivot rows 의 개수
    let cnt_row = 1;
    for (let i in row_field_list)
        cnt_row *= getListLength(row_field_list[i], true);

    // pivot mapping cell
    let mapping_result_cnt = setCellMapping(table, pivot_list.row_list, pivot_list.col_list,
                                            row_field_list, col_field_list, pivot_list.agg_list, result_list, type);
    console.log(mapping_result_cnt)
    setCellMapping_bak(table, pivot_list.row_list, pivot_list.col_list, pivot_list.agg_list, result_list, type);

    let mapping_cell = mapping_result_cnt.cell_mapping_list;

    let row_mapping_list = mapping_result_cnt.row_mapping_list;

    let col_mapping_list = mapping_result_cnt.col_mapping_list;

    // Draw pivot table
    let html = drawPivotTable(table, row_field_list, col_field_list, pivot_list.agg_list, mapping_cell, result_list, pivot_list);

    $('#' + target).html(null);
    $('#' + target).html(html);

    setPivotDataImport(table, result_list, row_list_count, col_list_count,
                        row_mapping_list, col_mapping_list, mapping_cell, pivot_list.agg_list);

    let row_group_list = [];
    for (let i in row_field_list) {
        row_group_list.push(i)
    }

    let mapping_cell_cnt = getListLength(mapping_cell[0], false);

    let delete_columns = [];
    let result_table = $("#" + table).DataTable({
        destroy: true,
        searching: false,
        paging: true,
        lengthChange: true,
        lengthMenu: [10, 25, 50, 100, 250, 500, 1000],
        pageLength: pivot_style.pageLength,
        info: false,
        ordering: false,
        rowsGroup: row_group_list,
        createdRow: function (row, data, dataIndex) {
            console.log("createdRow")
        },
        footerCallback: function (row, data, start, end, display) {
            let api = this.api();
            let cell_count = mapping_cell_cnt + agg_list_count;
            delete_columns = [];
            for (let i = row_list_count; i < cell_count; i++) {
                let cell_cnt = 0;
                let exist_columns = false;
                let sum_col = api
                    .column(i)
                    .data()
                    .reduce(function (a, b) {
                        if (!isEmpty(b)) {
                            var cell_split = b.split('.')[1];
                            if (!isEmpty(cell_split))
                                cell_cnt = b.split('.')[1].length;
                            if (!isEmpty(b))
                                exist_columns = true;
                        }
                        b = b.replace(/%/gi, '').replace(/,/gi, '');
                        return Number(a) + Number(b);
                    }, 0);
                if (!exist_columns)
                    delete_columns.push(i);
                $(api.column(i).footer()).html(sum_col);
            }
        },
        drawCallback: function (settings) {
            // DataTables page length page list
            if (Number(settings._iDisplayLength) !== 25) {
                // check
                $("#pivot_row_num").val(Number(settings._iDisplayLength));
                $("#pivot_row_num").trigger("change");
            }

            let api = this.api();
            let rows = api.rows({page: 'all'}).nodes();
            let last = null;

            let title_cnt = row_list_count;
            let data_cnt = mapping_cell_cnt;

            // Remove the formatting to get integer data for summation
            var total = [];
            var view_cnt = data_cnt + agg_list_count;
            if (!pivot_style.row_total) {
                //total cnt 추가
                view_cnt = view_cnt - agg_list_count;
            }
            $.each(api.column(0, {page: 'all'}).data(), function (i, group) {
                let group_assoc = group.replace(' ', "_");
                if (typeof total[group_assoc] != 'undefined') {
                    for (let j = 0; j < view_cnt - row_list_count; j++) {
                        let cell_data = api.column(j + title_cnt).data()[i];
                        let pre_data = total[group_assoc][j];
                        let cell_cnt = 0;
                        let sum_data = '';
                        if (!isEmpty(cell_data.split(".")[1]))
                            cell_cnt = cell_data.split(".")[1].length;
                        if (!isEmpty(cell_data)) {
                            cell_data = Number(cell_data.replace(/%/gi, '').replace(/,/gi, ''));
                            sum_data = pre_data + cell_data;
                        } else if (!isEmpty(pre_data)) {
                            sum_data = pre_data;
                        }
                        if (isEmpty(sum_data))
                            total[group_assoc][j] = sum_data;
                        else
                            total[group_assoc][j] = Number(sum_data);
                    }
                } else {
                    let row_data = [];
                    for (let j = 0; j < view_cnt-row_list_count; j++) {
                        let cell_cnt = 0;
                        let cell_data = api.column(Number(j) + Number(title_cnt)).data()[i];
                        if (!isEmpty(cell_data)) {
                            if (!isEmpty(cell_data.split(".")[1]))
                                cell_cnt = cell_data.split(".")[1].length;
                            cell_data = cell_data.replace(/%/gi, '').replace(/,/gi, '');
                        }
                        if (isEmpty(cell_data))
                            row_data.push(cell_data);
                        else
                            row_data.push(Number(cell_data));
                    }
                    total[group_assoc] = $.extend(true, [], row_data);
                }
            });
            $.each(api.column(0, {page: 'all'}).data(), function (i, group) {
                let group_assoc = group.replace(' ', "_");
                if (last !== group) {
                    let html = '<tr class="group">';
                    html += '<td colspan="' + title_cnt + '">' + group_assoc + ' Total : </td>';
                    let row_list = $.extend(true, [], total[group_assoc]);
                    let cell_cnt = data_cnt;

                    let view_cnt = cell_cnt + agg_list_count;
                    if (!pivot_style.row_total) {
                        view_cnt = view_cnt - agg_list_count;
                    }

                    for (let j = 0; j < view_cnt-row_list_count; j++) {
                        if (!(delete_columns.indexOf(Number(j) + Number(title_cnt)) > -1)) {
                            let cell_val = row_list[j];
                            html += '<td>' + cell_val + '</td>'
                        }
                    }
                    html += '</tr>';
                    $(rows).eq(i).before(html);
                    last = group;
                }
            });

            let cell_count = mapping_cell_cnt;
            if (!pivot_style.row_total){
                for (let i = cell_count; i < cell_count + agg_list_count; i++)
                    delete_columns.push(i)
            }
            this.api().columns().visible(true);
            this.api().columns(delete_columns).visible(false);
        },
    });

    if (pivot_style.column_total) {
        $('#' + table + '_pivot_footer').show();
    } else {
        $('#' + table + '_pivot_footer').hide();
    }

    if (pivot_style.sub_total) {
        $('.group').show();
    } else {
        $('.group').hide();
    }
};

// pivot 열 제한(너무 많을 경우 그리다가 뻗는 경우 제한을 두고 한정적으로 보여줌)
const columnLimitList = function (col_field_list, aggregation_list, limit_cnt){
    // 열 제한
    let col_limit_cnt = getListLength(aggregation_list, true);
    let copy_list = $.extend(true, [], col_field_list);
    let count_column = getListLength(copy_list, false);
    for (let i = count_column - 1; i >= 0; i--){
        let cnt = 0;
        if (i === 0){
            let col_zero_list = [];
            for (let j in copy_list[i]){
                cnt = cnt + col_limit_cnt;
                if (cnt < limit_cnt){
                    col_zero_list.push(copy_list[i][j])
                }
            }
            copy_list[i] = $.extend(true, [], col_zero_list);
        } else {
            col_limit_cnt *= getListLength(copy_list[i], true);
        }
    }
    return copy_list;
};

// pivot table cell mapping 리스트 설정
const setCellMapping_bak = function (table, row_field_list, col_field_list, aggregation_list, result_list) {
    let row_names_list = [];
    let row_cnt = getListLength(row_field_list, false);
    for (let i = 0; i < row_cnt; i++){
        row_names_list.push(row_field_list[i].key);
    }

    let col_names_list = [];
    let col_cnt = getListLength(col_field_list, false);
    for (let i = 0; i < col_cnt; i++){
        col_names_list.push(col_field_list[i].key);
    }

    let agg_names_list = [];
    let agg_cnt = getListLength(aggregation_list, false);
    for (let i = 0; i < agg_cnt; i++){
        agg_names_list.push(aggregation_list[i].calculate + '_' + aggregation_list[i].key);
    }

    let concat_list = [];
    for (let i in result_list){
        concat_list = concat_list.concat(result_list[i]);
    }


};


const setCellMapping = function (table, row_field_info, col_field_info, row_field_list, col_field_list, aggregation_list, result_list) {
    let concat_list = [];
    for (let i in result_list){
        concat_list = concat_list.concat(result_list[i]);
    }

    let row_names_list = [];
    let row_cnt = getListLength(row_field_info, false);
    for (let i = 0; i < row_cnt; i++){
        row_names_list.push(row_field_info[i].key);
    }

    // set_row_mapping_list
    let row_mapping_list = [];
    let row_str = '';
    for (let i in row_names_list){
        row_str += row_names_list[i];
        if (Number(i) !== row_cnt -1)
            row_str += ',';
    }

    let qry_row = 'select ' + row_str + ' from ? group by ' + row_str + ' order by ' + row_str;
    alasql.options.cache = false;
    let row_data = alasql(qry_row, [concat_list]);

    for (let i in row_data){
        let o = [];
        for (let j in row_names_list){
            o.push(row_data[i][row_names_list[j]]);
        }
        row_mapping_list.push(o);
    }

    // column count list
    let col_count_list = [];
    for (let i in col_field_list) {
        col_count_list.push(getListLength(col_field_list[i], false));
    }
    col_count_list.push(getListLength(aggregation_list, false));

    // row count list
    let row_count_list = [];
    for (let i in row_field_list) {
        row_count_list.push(getListLength(row_field_list[i], false));
    }

    // total columns count
    let total_col_cnt = 1;
    for (let i in col_count_list) {
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
        for (let j = Number(i) + 1; j < getListLength(col_count_list, false); j++) {
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
        if (Number(i) !== getListLength(col_count_list, false) - 1) {
            for (let m = 0; m < col_cnt_2; m++) {
                for (let j in col_field_list[i]) {
                    for (let l = 0; l < col_cnt_1; l++) {
                        col_mapping_list[cnt].push(col_field_list[i][j]);
                        cnt++;
                    }
                }
            }
        } else {
            for (let j = 0; j < total_col_cnt / getListLength(aggregation_list, true); j++) {
                for (let i in aggregation_list) {
                    col_mapping_list[cnt].push(aggregation_list[i].calculate + '_' + aggregation_list[i].key);
                    cnt++;
                }
            }
        }
    }

    // get total row count
    let total_row_cnt = 1;
    for (let i in row_count_list) {
        total_row_cnt = total_row_cnt * row_count_list[i];
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

    return {
        "col_mapping_list": col_mapping_list,
        "row_mapping_list": row_mapping_list,
        "cell_mapping_list": mapping_result
    };
};

// Pivot Table 구성
// 값이 들어가지는 않고 틀만 생성
// 추후 pivot 값을 통해서 해당 필드에 넣어 줘야 함
const drawPivotTable = function (table, row_field_list, col_field_list, aggregation_list, mapping_cell, result_list, pivot_list, type) {
    let row_field_name_list = [];
    let col_field_name_list = [];

    for (let i in pivot_list.row_list)
        row_field_name_list.push(pivot_list.row_list[i].key);

    for (let i in pivot_list.col_list)
        col_field_name_list.push(pivot_list.col_list[i].key);

    // Draw Table
    // cnt -> colspan, rows 에 활용
    let title_row = getListLength(row_field_list, false);
    let title_col = getListLength(col_field_list, false);

    // Table Html 생성
    let html = '<table class="table table-bordered table-nowrap text-center" id="' + table + '" style="width:100%">';
    html += '<thead>';

    // Add Title Row
    // Row Pivot 선택시 선택했던 필드 이름 + Column 의 값과 aggregation 값 표시(Header Row)
    for (let i in col_field_list) {
        html += '<tr>';

        if (Number(i) === 0) {
            html += '<th class="table_columns_header" colspan="' + (title_row) + '" rowspan="' + (title_col) + '" style="white-space: nowrap"></th>'
        }

        let colspan_cnt = 1;
        for (let j = Number(i) + 1; j < getListLength(col_field_list, false); j++){
            colspan_cnt = colspan_cnt * getListLength(col_field_list[j], false)
        }

        if (Number(i) !== 0){
            let col_cnt = 1;
            for (let l = 0; l < Number(i); l++){
                col_cnt = col_cnt * getListLength(col_field_list[l], false);
            }
            for (let l = 1; l <= col_cnt; l++){
                for (let j in col_field_list[i]){
                    let val = col_field_list[i][j];
                    html += '<th class="table_columns_header" colspan="' + colspan_cnt * (getListLength(aggregation_list, false)) + '" style="white-space: nowrap">' + val + '</th>'
                }
            }
        } else {
            for (let j in col_field_list[i]){
                let val = col_field_list[i][j];
                html += '<th class="table_columns_header" colspan="' + colspan_cnt * (getListLength(aggregation_list, false)) + '" style="white-space: nowrap">' + val + '</th>'
            }
        }

        if (type !== 'raw'){
            if (Number(i) === 0){
                html += '<th class="table_columns_header" rowspan="' + (title_col) + '" colspan="' + getListLength(aggregation_list, false) + '" style="white-space: nowrap">Total: </th>'
            }
        }

        html += '</tr>'
    }

    // Add aggregation Header
    html += '<tr>';

    let aggregation_cnt = 1;
    let col_list_cnt = getListLength(col_field_list[0], true);

    for (let i in col_field_list) {
        aggregation_cnt *= getListLength(col_field_list[i], true);
    }

    for (let j in row_field_name_list) {
        html += '<th class="table_aggregation_header" style="white-space: nowrap">' + row_field_name_list[j] + '</th>'
    }
    for (let j = 0; j < aggregation_cnt; j++) {
        for (let i in aggregation_list) {
            // if (aggregation_field[i].name_change)
            //     html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_field[i].name + '</th>';
            // else
            html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_list[i].calculate + ' of ' + aggregation_list[i].key + '</th>'
        }
    }

    if (type !== 'raw'){
        if (isEmpty(col_field_list)){
            for (let i in aggregation_list){
                // if (aggregation_list[i].name_change)
                //     html += '<th class="table_aggregation_header" style="white-space: nowrap"> Total :' + aggregation_field[i].name + '</th>';
                // else
                html += '<th class="table_aggregation_header" style="white-space: nowrap"> Total : ' + aggregation_list[i].calculate + ' of ' + aggregation_list[i].key + '</th>'
            }
        } else {
            for (let i in aggregation_list){
                html += '<th class="table_aggregation_header" style="white-space: nowrap">' + aggregation_list[i].calculate + ' of ' + aggregation_list[i].key + '</th>'
            }
        }
    }

    html += '</tr>';
    html += '</thead>';


    html += '<tbody class="text-right">';
    // data_set
    let pivot_row = pivot_list.rows;
    let row_cnt = getListLength(row_field_list, false);
    let mapping_cnt = getListLength(mapping_cell[0], false);

    for (let i in mapping_cell) {
        html += '<tr>';
        for (let j = 0; j < row_cnt; j ++) {
            let val = mapping_cell[i][j];
            // if (pivot_row[j].type === 'date')
            //     val = setDateTypeDetail(val, pivot_row[j].type_detail);
            html += '<td class="text-left">' + val + '</td>'
        }

        for (let j=0; j < mapping_cnt - row_cnt; j++) {
            html += '<td id="' + table + '_row' + i + '_col' + j + '">';
            html += '</td>'
        }
        if (type !== 'raw') {
            for (var j in aggregation_list)
                html += '<td id= "' + table + '_row_total_' + j + '_' + i + '"></td>';
        }
        html += '</tr>'
    }
    html += '</tbody>';

    if (type !== 'raw') {
        html += '<tfoot id="' + table + '_pivot_footer">';
        let mapping_cell_count = getListLength(mapping_cell[0], false);
        let row_field_cnt = getListLength(row_field_list, false);
        let agg_field_cnt = getListLength(aggregation_list, false);
        let cell_count = mapping_cell_count - row_field_cnt + agg_field_cnt;
        html += '<tr>';
        html += '<th colspan="' + row_field_cnt + '">Total : </th>';
        for (let i = 0; i < cell_count ; i++) {
            html += '<th></th>'
        }
        html += '</tr>';
        html += '</tfoot>';
    }

    html += '</table>';
    return html;
};

const setPivotDataImport = function (table, result_list, row_list_count, col_list_count,
                                     row_mapping_list, col_mapping_list, mapping_cell, aggregation_list){
    // data import
    for (let i in result_list) {
        let last_cnt = row_list_count + col_list_count;
        for (let j in result_list[i]) {
            let str = "";
            let cur_cnt = 0;
            let cell_val = "";
            let row_cnt = row_list_count;
            let r_list = [];
            let c_list = [];
            $.each(result_list[i][j], function (key, value) {
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
            let r_idx = row_mapping_list.findIndex((item, idx) => {
                return JSON.stringify(item) === JSON.stringify(r_list);
            });
            let c_idx = col_mapping_list.findIndex((item, idx) => {
                return JSON.stringify(item) === JSON.stringify(c_list);
            });
            str = "row" + r_idx + "_col" + c_idx;

            $("#" + table + "_" + str).html(cell_val);
        }
    }

    // row_total 계산
    let row_total_list = [];
    for (let i in mapping_cell) {
        let row_total = [];
        for (let j in aggregation_list)
            row_total.push(0);
        for (let j in mapping_cell[i]) {
            let row_total_field = Number(j) % getListLength(aggregation_list, true);
            row_total[row_total_field] = row_total[row_total_field] + Number($("#" + table + "_row" + i + "_col" + j).text())
        }
        row_total_list.push(row_total);
        for (let j in aggregation_list) {
            $("#" + table + "_row_total_" + j + "_" + i).html(row_total[Number(j)])
        }
    }
}
