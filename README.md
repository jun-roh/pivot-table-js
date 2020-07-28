# pivot-table-js

### Javascript Pivot Table Project

####[개발 배경]

기존의 javascript 기반의 pivot table 조사

원하는 기능

* N 개 row value
* N 개 column value
* N 개 aggregation value
* Row Total
* Column Total
* Sub Total
* (추후) custom 조건부서식

Open Source 중에서 이 모든 조건에 해당하는 것이 없어 여러 라이브러리들을 조합하여 Pivot Table Sample 개발

#### [ Using Library ]

* jQuery
* alasql.js
* datatables.js

#### [ parameter Info ]
* row_field : pivot table 의 기준 row
* col_field : pivot table 의 기준 column
* aggregation_field : pivot table 의 aggregation
* mapping_cell : Table Map List Data(테이블 그리기 위해서 필요)
* row_total_chk : row total visible true or false
* t : Datatables table 


* getPivotQry() : AlaSql Pivot 함수 쿼리를 통해서 결과
* getDistinctQry() : AlaSql Distinct 함수 쿼리 처리
* setCellMapping() : Table Map List Data(테이블 그리기 위해서 필요)

#### [ 실행 ]
```
getPivotTable(row_field, col_field, aggregation_field)
```
