一、需求分析
order 页展现数据库中的 order 内容，方便用户统一查看管理所有订单。

**orders 数据格式**
{
"id": "1", ---该订单唯一标识；
"customerId": 46, ---下单客户标识；
"currency": "EUR", ---交易币种
"status": "paid", ---交易状态；
"paymentMethod": "paypal", ---支付方式
"createdAt": "2025-06-27T14:43:30.540Z", ---交易时间；
"updatedAt": "2025-06-27T14:43:30.540Z", ---订单更新时间；
"subtotal": 257.7, ---商品价格（不含运费、不含税）
"tax": 20.62, ---订单税费
"shipping": 15, ---订单运费
"total": 293.32, ---总价
"note": "" --备注
},

1.1 主页面展示内容
id/created/customer/status/total。意在展示全局订单信息，以及客户认为重要的四大标签。
标题侧：表格左上角，显示 orders 数据总条数+总页数；
5 列展示所有数据。
分页与下一页：分页功能。

注：列的展示规则
ID：字符串展示（如 #0001），是否可点击进入详情？（静态页可先做“假链接”）
Created：显示格式（推荐 YYYY-MM-DD HH:mm）与时区（Asia/Taipei），默认 按 createdAt 降序。
Customer：显示“客户名 / 邮箱 / 无则 Customer #<id> 的回退规则”。（当前只有 customerId，你要么在静态页放“Customer #46”，要么在 mock 里临时加 customerName 字段）
Status：枚举与颜色映射（例：paid=green、pending=gold、shipped=blue、cancelled=red、refunded=purple）。
Total：右对齐，货币用 currency（EUR/USD/CNY）渲染；小数保留 2 位。

1.2
