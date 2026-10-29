# S1 数据库设计记录

本设计对应 PB-01。用户选择 XAMPP；它自带 MariaDB，数据库迁移需在实际使用的 MariaDB 版本上验证。S1 迁移只创建账户、角色、车辆和行程基础表；Booking 和 Feedback 属于整体设计，表结构和迁移随相应功能在后续 Sprint 完善。

## 实体关系

- User 与 Customer、Driver、Admin 的主键相同；初版每个账户一种角色。注册时应用须在同一事务中创建 User 和对应角色，并保证角色一致。管理员通过受控流程创建。
- Driver 一对多 Car，一对多 Trip；Trip 关联一个 Car。复合外键确保行程所用车辆属于对应司机。车辆可用于多个不同时期的行程。
- Customer 一对多 Booking，Trip 一对多 Booking。一条预订申请一个座位。Booking 表与详细状态在后续 Sprint 确定。
- User 一对多 Feedback，Trip 一对多 Feedback；反馈与管理员处理记录在后续 Sprint 设计。当前交付仅计划乘客反馈，报告中的司机反馈需同步调整。

## 字段和约束

可执行字段、类型、主外键、索引及检查约束见 `database/001_base.sql`。邮箱使用唯一索引；应用保存与查询前需去除首尾空格并统一大小写。密码只保存哈希。示例种子不包含真实个人信息，也不能用于登录。

后续实体的数据字典草案（非 S1 已建表）：

| 实体 | 字段 | 说明 |
| --- | --- | --- |
| Booking | booking_id, customer_id, trip_id | 主键，以及指向乘客和行程的外键 |
| Booking | status, requested_at, reviewed_at | 状态 PENDING / ACCEPTED / REJECTED，请求时间必填，处理时间可空 |
| Feedback | feedback_id, trip_id, author_user_id | 主键，以及行程和提交用户的外键 |
| Feedback | rating, comment | 评分 1–5 或评论（至多 500 字符），至少填写一项；当前计划只允许符合条件的乘客提交一次且不可修改 |
| Feedback | handling_status, admin_remark, handled_by_admin_id, created_at, updated_at | 处理状态、可选备注、处理人和时间；处理细节将在后续迭代确认 |

以上是回复文档中的草案，随功能迭代再次确认；并不表示这些表或反馈功能已经实现。

设计使用生成列和唯一索引保证一个司机同时最多一条 ACTIVE 行程，需在 XAMPP 的 MariaDB 中验证。复合外键验证车辆归属。座位范围、价格、状态和必填值由数据库检查；行程座位不得超过车辆容量需要未来的服务端事务检查（该跨表规则尚未由此迁移实现）。

预订接受需要在事务内检查行程、请求及剩余座位，并同时改变状态与扣减座位；并发、重复请求测试在 Booking 实现时完成。行程开始时仍为 Pending 的请求变为 Rejected；具体触发机制在实现该功能时确定。司机不能修改行程，只能取消。用户停用及相关记录处理放入后续迭代。

## 验证目标

在独立的空测试数据库中顺序执行迁移和种子，验证重建、外键、邮箱唯一、取值检查、单司机 Active 唯一限制和查询索引；用两个独立连接检查已提交数据共享。删除或重建数据库之前必须确认是专用测试数据库。生产数据不使用种子。
