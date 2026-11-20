SET NAMES utf8mb4;

CREATE TABLE `shop` (
  `shop_id` bigint NOT NULL AUTO_INCREMENT COMMENT '店铺主键',
  `shop_name` varchar(64) NOT NULL COMMENT '店铺名称',
  `image` varchar(512) DEFAULT NULL COMMENT '店铺图片地址',
  `description` varchar(1000) NOT NULL DEFAULT '' COMMENT '店铺介绍',
  `shop_address` varchar(255) NOT NULL COMMENT '店铺地址',
  `phone` varchar(20) NOT NULL COMMENT '商家联系电话',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '营业状态：0休息，1营业',
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '每单配送费，单位元',
  `pack_price` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '每件商品包装费，单位元',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`shop_id`),
  CONSTRAINT `chk_shop_status` CHECK (`status` IN (0, 1)),
  CONSTRAINT `chk_shop_delivery_fee` CHECK (`delivery_fee` >= 0),
  CONSTRAINT `chk_shop_pack_price` CHECK (`pack_price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店铺信息';

-- 以下为虚构测试门店，图片复用小程序现有静态 Logo，电话为占位号码。
START TRANSACTION;

INSERT INTO `shop`
  (`shop_id`, `shop_name`, `image`, `description`, `shop_address`, `phone`, `status`, `delivery_fee`, `pack_price`)
VALUES
  (1, '苍穹外卖（科技园店）', '/static/logo_ruiji.png',
   '主打川味家常菜与酸菜鱼，提供工作日午餐和晚餐。',
   '北京市海淀区示例路1号科技园A座一层（测试地址）', '010-00000001', 1, 3.00, 1.00),
  (2, '苍穹外卖（大学城店）', '/static/logo_ruiji.png',
   '提供实惠单人餐、双人套餐和饮料。',
   '北京市海淀区示例路2号大学城商业街（测试地址）', '010-00000002', 1, 2.00, 0.50),
  (3, '苍穹外卖（商务中心店）', '/static/logo_ruiji.png',
   '提供商务套餐和多人餐，当前休息中。',
   '北京市朝阳区示例路3号商务中心B座一层（测试地址）', '010-00000003', 0, 5.00, 1.50);

COMMIT;
