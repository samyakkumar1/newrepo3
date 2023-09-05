-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema logomaker
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema logomaker
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `logomaker` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
USE `logomaker` ;

-- -----------------------------------------------------
-- Table `logomaker`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`users` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL,
  `md5_password` VARCHAR(64) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL,
  `salt` VARCHAR(64) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NOT NULL,
  `regd_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `first_name` VARCHAR(64) CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci' NULL,
  `last_name` VARCHAR(64) NULL,
  `phone_num` VARCHAR(15) NULL,
  `last_login_time` TIMESTAMP NULL,
  `address` VARCHAR(255) NULL,
  `country` VARCHAR(20) NULL,
  `city` VARCHAR(45) NULL,
  `state` VARCHAR(45) NULL,
  `postal_code` VARCHAR(45) NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`logos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`logos` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`logos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `s3_logo_url` VARCHAR(255) NULL,
  `desc` VARCHAR(255) NULL,
  `title` VARCHAR(255) NULL,
  `status` ENUM(  'Active',  'Deleted', 'Purchased' ) NOT NULL DEFAULT 'Active',
  `url` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` VARCHAR(255) NULL,
  `seo_keyword` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `purchased_at` TIMESTAMP NULL,
  `visible` TINYINT(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `url_UNIQUE` (`url` ASC, `status` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`user_logos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`user_logos` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`user_logos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `base_logo_id` BIGINT UNSIGNED NOT NULL,
  `company_name` VARCHAR(64) NULL,
  `slogan` VARCHAR(64) NULL,
  `s3_logo_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `modified_at` TIMESTAMP NULL,
  `status` ENUM('Active','Deleted') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  INDEX `fk_logos_users_idx` (`user_id` ASC),
  INDEX `fk_user_logos_logos1_idx` (`base_logo_id` ASC),
  CONSTRAINT `fk_logos_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_logos_logos1`
    FOREIGN KEY (`base_logo_id`)
    REFERENCES `logomaker`.`logos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`cards`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`cards` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`cards` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `s3_front_card_url` VARCHAR(255) NULL,
  `s3_back_card_url` VARCHAR(255) NULL,
  `desc` VARCHAR(255) NULL,
  `title` VARCHAR(255) NULL,
  `url` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` VARCHAR(255) NULL,
  `seo_keyword` VARCHAR(255) NULL,
  `status` ENUM('Active','Deleted') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `url_UNIQUE` (`url` ASC, `status` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`user_cards`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`user_cards` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`user_cards` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `design_type` ENUM(  'SystemDesign',  'UserDesign' ) NULL DEFAULT 'SystemDesign',
  `base_card_id` BIGINT UNSIGNED NULL,
  `company_name` VARCHAR(64) NULL,
  `slogan` VARCHAR(64) NULL,
  `first_name` VARCHAR(64) NULL,
  `last_name` VARCHAR(64) NULL,
  `address_line_1` VARCHAR(64) NULL,
  `address_line_2` VARCHAR(64) NULL,
  `website` VARCHAR(64) NULL,
  `email` VARCHAR(64) NULL,
  `phone_no` VARCHAR(64) NULL,
  `s3_front_card_url` VARCHAR(255) NULL,
  `s3_back_card_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `modified_at` TIMESTAMP NULL,
  `qty` INT NULL,
  `finish` ENUM('MATT','GLOSS') NULL,
  `paper_stock` ENUM('Premium','UltraPremium') NULL,
  `back_of_card` ENUM('Blank','Appointment','Custom') NULL,
  `back_side_super_premium` TINYINT(1) NULL,
  `shipping_type` ENUM('Std', 'Exp') NULL,
  `purchase_design` TINYINT(1) NULL DEFAULT 0,
  `dont_print_card` TINYINT(1) NULL DEFAULT 0,
  `status` ENUM('Active','Deleted') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  INDEX `fk_logos_users_idx` (`user_id` ASC),
  INDEX `fk_user_cards_cards1_idx` (`base_card_id` ASC),
  CONSTRAINT `fk_logos_users0`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_cards_cards1`
    FOREIGN KEY (`base_card_id`)
    REFERENCES `logomaker`.`cards` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`shipping_address`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`shipping_address` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`shipping_address` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `email_address` VARCHAR(255) NULL,
  `phone_number` VARCHAR(255) NULL,
  `first_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NULL,
  `address1` VARCHAR(255) NULL,
  `address2` VARCHAR(255) NULL,
  `city` VARCHAR(255) NULL,
  `state` VARCHAR(255) NULL,
  `country` VARCHAR(10) NULL,
  `postal_code` VARCHAR(20) NULL,
  `show_in_list` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_shipping_address_users1_idx` (`user_id` ASC),
  CONSTRAINT `fk_shipping_address_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`shopping_carts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`shopping_carts` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`shopping_carts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `modified_at` TIMESTAMP NULL,
  `status` ENUM('PURCHASED','PENDING') NULL,
  `shipping_type` ENUM('FREE', '7DAYS', '3DAYS') NULL,
  `payement_type` ENUM('PAYPAL', 'PAYTM') NULL,
  `price` DOUBLE NULL,
  `currency` ENUM('INR','USD','EUR','AUD','SGD','AED','GBP','CAD','NZD','JPY','SEK','DKK','LTL','HKD','CHF','ISK','HUF') NULL,
  `date_purchased` VARCHAR(45) NULL,
  `txn_id` VARCHAR(45) NULL,
  `shipping_address_id` BIGINT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_shopping_carts_users1_idx` (`user_id` ASC),
  INDEX `fk_shopping_carts_purchase_address1_idx` (`shipping_address_id` ASC),
  CONSTRAINT `fk_shopping_carts_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_shopping_carts_purchase_address1`
    FOREIGN KEY (`shipping_address_id`)
    REFERENCES `logomaker`.`shipping_address` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`shopping_cart_items`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`shopping_cart_items` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`shopping_cart_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shopping_cart_id` BIGINT UNSIGNED NOT NULL,
  `item_id` BIGINT UNSIGNED NOT NULL,
  `item_type` ENUM('BC','LOGO','OTHER') NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_shopping_cart_items_shopping_carts1_idx` (`shopping_cart_id` ASC),
  CONSTRAINT `fk_shopping_cart_items_shopping_carts1`
    FOREIGN KEY (`shopping_cart_id`)
    REFERENCES `logomaker`.`shopping_carts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`categories` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(64) NULL,
  `category_desc` VARCHAR(2000) NULL,
  `hide_category` BIGINT(4) NULL DEFAULT 0,
  `url` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` VARCHAR(255) NULL,
  `seo_keyword` VARCHAR(255) NULL,
  `status` ENUM(  'Active',  'Deleted' ) NOT NULL DEFAULT 'Active',
  `logo_category` TINYINT(1) NULL DEFAULT 1,
  `card_category` TINYINT(1) NULL DEFAULT 0,
  `other_category` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `url_UNIQUE` (`url` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`countries`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`countries` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`countries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `country` VARCHAR(200) NULL,
  `currency` ENUM('INR','USD','EUR','AUD','SGD','AED','GBP','CAD','NZD','JPY','SEK','DKK','LTL','HKD','CHF','ISK','HUF') NOT NULL DEFAULT 'USD',
  `code` VARCHAR(20) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `country_UNIQUE` (`country` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`vc_pricing`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`vc_pricing` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`vc_pricing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `country` INT NOT NULL,
  `finish` ENUM('MATT', 'GLOSS') NOT NULL,
  `qty` INT NOT NULL,
  `premium` DOUBLE NOT NULL,
  `back_side` DOUBLE NOT NULL,
  `super_premium` DOUBLE NOT NULL,
  `back_side_super_premium` DOUBLE NOT NULL,
  `std_shipping` DOUBLE NOT NULL,
  `exp_shipping` DOUBLE NOT NULL,
  `card_design` DOUBLE NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `fk_vc_pricing_countries1_idx` (`country` ASC),
  CONSTRAINT `fk_vc_pricing_countries1`
    FOREIGN KEY (`country`)
    REFERENCES `logomaker`.`countries` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`logo_pricing`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`logo_pricing` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`logo_pricing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `country` INT NULL,
  `price` DOUBLE NULL,
  `color_changes` DOUBLE NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_logo_pricing_countries1_idx` (`country` ASC),
  UNIQUE INDEX `country_UNIQUE` (`country` ASC),
  CONSTRAINT `fk_logo_pricing_countries1`
    FOREIGN KEY (`country`)
    REFERENCES `logomaker`.`countries` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`news_letter`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`news_letter` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`news_letter` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NULL,
  `regd_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`shipping`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`shipping` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`shipping` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shipper_name` VARCHAR(255) NULL,
  `status` VARCHAR(255) NULL,
  `expected_date` VARCHAR(255) NULL,
  `tracking_id` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`purchased_items`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`purchased_items` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`purchased_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `shopping_cart_id` BIGINT UNSIGNED NULL,
  `type` ENUM('BC', 'LOGO','OTHER') NULL,
  `base_item_id` BIGINT UNSIGNED NULL,
  `url` VARCHAR(255) NULL,
  `url_back` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` TIMESTAMP NULL,
  `status` ENUM('PRINTING', 'PRINTED', 'NOT_PRINTED') NULL,
  `company_name` VARCHAR(200) NULL,
  `slogan` VARCHAR(200) NULL,
  `first_name` VARCHAR(200) NULL,
  `last_name` VARCHAR(200) NULL,
  `address_line_1` VARCHAR(200) NULL,
  `address_line_2` VARCHAR(200) NULL,
  `website` VARCHAR(200) NULL,
  `email` VARCHAR(200) NULL,
  `phone_no` VARCHAR(200) NULL,
  `qty` INT NULL,
  `finish` ENUM( 'MATT','GLOSS') NULL,
  `paper_stock` ENUM( 'Premium','UltraPremium' ) NULL,
  `back_of_card` ENUM( 'Blank','Appointment','Custom' ) NULL,
  `back_side_super_premium` TINYINT(1) NULL,
  `design_type` ENUM(  'SystemDesign',  'UserDesign' ) NULL DEFAULT 'SystemDesign',
  `purchased_items` TINYINT(1) NULL,
  `purchase_design` TINYINT(1) NULL DEFAULT 0,
  `dont_print_card` TINYINT(1) NULL,
  `shipping_type` ENUM( 'Std','Exp' ) NULL,
  `shipping_info_id` BIGINT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_purchased_items_shopping_carts1_idx` (`shopping_cart_id` ASC),
  INDEX `fk_purchased_items_shipping1_idx` (`shipping_info_id` ASC),
  CONSTRAINT `fk_purchased_items_shopping_carts1`
    FOREIGN KEY (`shopping_cart_id`)
    REFERENCES `logomaker`.`shopping_carts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchased_items_shipping1`
    FOREIGN KEY (`shipping_info_id`)
    REFERENCES `logomaker`.`shipping` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`download_logos`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`download_logos` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`download_logos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `logo_id` BIGINT UNSIGNED NULL,
  `downloaded_time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_download_logos_users1_idx` (`user_id` ASC),
  INDEX `fk_download_logos_user_logos1_idx` (`logo_id` ASC),
  CONSTRAINT `fk_download_logos_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_download_logos_user_logos1`
    FOREIGN KEY (`logo_id`)
    REFERENCES `logomaker`.`user_logos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`transactions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`transactions` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `payment_gateway` ENUM('Paypal','Paytm') NULL,
  `transaction_id` VARCHAR(130) NULL,
  `status` ENUM('Success','Failure','Cancel') NULL,
  `failure_details` VARCHAR(2048) NULL,
  `timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_transactions_users1_idx` (`user_id` ASC),
  CONSTRAINT `fk_transactions_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`logo_categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`logo_categories` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`logo_categories` (
  `logo_id` BIGINT UNSIGNED NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `status` ENUM(  'Active',  'Deleted' ) NULL DEFAULT 'Active',
  UNIQUE INDEX `logo_id_UNIQUE` (`logo_id` ASC, `category_id` ASC),
  INDEX `fk_logo_categories_categories1_idx` (`category_id` ASC),
  CONSTRAINT `fk_logo_categories_logos1`
    FOREIGN KEY (`logo_id`)
    REFERENCES `logomaker`.`logos` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_logo_categories_categories1`
    FOREIGN KEY (`category_id`)
    REFERENCES `logomaker`.`categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_logo_categories_categories2`
    FOREIGN KEY (`category_id`)
    REFERENCES `logomaker`.`categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`card_categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`card_categories` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`card_categories` (
  `card_id` BIGINT UNSIGNED NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `status` ENUM(  'Active',  'Deleted' ) NOT NULL DEFAULT 'Active',
  UNIQUE INDEX `card_id_UNIQUE` (`card_id` ASC, `category_id` ASC),
  INDEX `fk_card_categories_categories1_idx` (`category_id` ASC),
  CONSTRAINT `fk_card_categories_cards1`
    FOREIGN KEY (`card_id`)
    REFERENCES `logomaker`.`cards` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_card_categories_categories1`
    FOREIGN KEY (`category_id`)
    REFERENCES `logomaker`.`categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`keywords`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`keywords` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`keywords` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `keyword` VARCHAR(255) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`category_keyword`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`category_keyword` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`category_keyword` (
  `category_id` BIGINT UNSIGNED NOT NULL,
  `keyword_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`category_id`, `keyword_id`),
  INDEX `fk_category_keyword_keywords1_idx` (`keyword_id` ASC),
  CONSTRAINT `fk_category_keyword_keywords1`
    FOREIGN KEY (`keyword_id`)
    REFERENCES `logomaker`.`keywords` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_category_keyword_categories1`
    FOREIGN KEY (`category_id`)
    REFERENCES `logomaker`.`categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`other_products`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`other_products` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`other_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `description` VARCHAR(2000) NULL,
  `base_image_url` VARCHAR(255) NULL,
  `base_image_back_url` VARCHAR(255) NULL,
  `back_logo_params` VARCHAR(1024) NULL,
  `front_logo_params` VARCHAR(1024) NULL,
  `base_params_front` VARCHAR(1024) NULL,
  `base_params_back` VARCHAR(1024) NULL,
  `status` ENUM('New', 'Active', 'Deleted') NULL DEFAULT 'New',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `seo_url` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` VARCHAR(255) NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `category` BIGINT UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `seo_url_UNIQUE` (`seo_url` ASC, `status` ASC),
  INDEX `fk_other_products_categories1_idx` (`category` ASC),
  CONSTRAINT `fk_other_products_categories1`
    FOREIGN KEY (`category`)
    REFERENCES `logomaker`.`categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`other_product_settings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`other_product_settings` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`other_product_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `setting_name` VARCHAR(255) NULL,
  `control_type` ENUM('Color','Combo','Radio','Checkbox','Text','Pricing Label','Quantity') NOT NULL DEFAULT 'Text',
  `page_number` INT NOT NULL DEFAULT 1,
  `related_setting` BIGINT UNSIGNED NULL,
  `independent_pricing` TINYINT(1) NOT NULL DEFAULT 0,
  `item_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('Active','Deleted') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  INDEX `fk_other_product_settings_other_products1_idx` (`product_id` ASC),
  INDEX `fk_other_product_settings_other_product_settings1_idx` (`related_setting` ASC),
  CONSTRAINT `fk_other_product_settings_other_products1`
    FOREIGN KEY (`product_id`)
    REFERENCES `logomaker`.`other_products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_other_product_settings_other_product_settings1`
    FOREIGN KEY (`related_setting`)
    REFERENCES `logomaker`.`other_product_settings` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`other_product_setting_values`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`other_product_setting_values` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`other_product_setting_values` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_id` BIGINT UNSIGNED NOT NULL,
  `value_label` VARCHAR(64) NOT NULL,
  `status` ENUM('Active','Deleted') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_setting_values_other_product_settings1`
    FOREIGN KEY (`setting_id`)
    REFERENCES `logomaker`.`other_product_settings` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`other_products_pricing`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`other_products_pricing` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`other_products_pricing` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_id` BIGINT UNSIGNED NULL,
  `country_id` INT NULL,
  `price` DOUBLE NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_other_products_pricing_countries1_idx` (`country_id` ASC),
  UNIQUE INDEX `country_product_unique` (`setting_id` ASC, `country_id` ASC),
  CONSTRAINT `fk_other_products_pricing_countries1`
    FOREIGN KEY (`country_id`)
    REFERENCES `logomaker`.`countries` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_other_products_pricing_other_product_setting_values1`
    FOREIGN KEY (`setting_id`)
    REFERENCES `logomaker`.`other_product_setting_values` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`other_products_designs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`other_products_designs` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`other_products_designs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `other_product_id` BIGINT UNSIGNED NULL,
  `design_file` VARCHAR(255) NULL,
  `status` ENUM('Deleted','Active') NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  INDEX `fk_other_products_designs_other_products1_idx` (`other_product_id` ASC),
  CONSTRAINT `fk_other_products_designs_other_products1`
    FOREIGN KEY (`other_product_id`)
    REFERENCES `logomaker`.`other_products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`user_other_products`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`user_other_products` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`user_other_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `base_product_id` BIGINT UNSIGNED NULL,
  `base_design_id` BIGINT UNSIGNED NULL,
  `user_logo_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('Active','Deleted') NULL DEFAULT 'Active',
  PRIMARY KEY (`id`),
  INDEX `fk_user_other_products_users1_idx` (`user_id` ASC),
  INDEX `fk_user_other_products_other_products_designs1_idx` (`base_design_id` ASC),
  INDEX `fk_user_other_products_other_products1_idx` (`base_product_id` ASC),
  INDEX `fk_user_other_products_user_logos1_idx` (`user_logo_id` ASC),
  CONSTRAINT `fk_user_other_products_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `logomaker`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_other_products_other_products_designs1`
    FOREIGN KEY (`base_design_id`)
    REFERENCES `logomaker`.`other_products_designs` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_other_products_other_products1`
    FOREIGN KEY (`base_product_id`)
    REFERENCES `logomaker`.`other_products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_other_products_user_logos1`
    FOREIGN KEY (`user_logo_id`)
    REFERENCES `logomaker`.`user_logos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `logomaker`.`user_other_product_settings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logomaker`.`user_other_product_settings` ;

CREATE TABLE IF NOT EXISTS `logomaker`.`user_other_product_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_other_product_id` BIGINT UNSIGNED NULL,
  `product_settings_id` BIGINT UNSIGNED NULL,
  `setting_value` VARCHAR(64) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_other_product_settings_user_other_products1_idx` (`user_other_product_id` ASC),
  INDEX `fk_user_other_product_settings_other_product_settings1_idx` (`product_settings_id` ASC),
  CONSTRAINT `fk_user_other_product_settings_user_other_products1`
    FOREIGN KEY (`user_other_product_id`)
    REFERENCES `logomaker`.`user_other_products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_other_product_settings_other_product_settings1`
    FOREIGN KEY (`product_settings_id`)
    REFERENCES `logomaker`.`other_product_settings` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
-- begin attached script 'script'



INSERT INTO `countries` (`id`, `country`, `currency`, `Code`) VALUES
(1, 'United States', 'USD', 'US'),
(2, 'Australia', 'AUD', 'AU'),
(3, 'Singapore', 'SGD', 'SG'),
(4, 'UAE', 'AED', 'AE'),
(5, 'UK', 'GBP', 'GB'),
(6, 'Canada', 'CAD', 'CA'),
(7, 'New Zealand', 'NZD', 'NZ'),
(8, 'Japan', 'JPY', 'JP'),
(9, 'Sweden', 'SEK', 'SE'),
(10, 'Denmark', 'DKK', 'DK'),
(11, 'Lithuania', 'LTL', 'LT'),
(12, 'Hongkong', 'HKD', 'HK'),
(13, 'Switzerland', 'CHF', 'SZ'),
(14, 'Liechtenstein', 'CHF', 'LI'),
(15, 'Iceland', 'ISK', 'IS'),
(16, 'Hungary', 'HUF', 'HU'),
(17, 'India', 'INR', 'IN'),
(18, 'Andorra', 'EUR', 'AD'),
(19, 'Austria', 'EUR', 'AT'),
(20, 'Belgium', 'EUR', 'BE'),
(21, 'Cyprus', 'EUR', 'CY'),
(22, 'Estonia', 'EUR', 'EE'),
(23, 'Finland', 'EUR', 'FI'),
(24, 'France', 'EUR', 'FR'),
(25, 'Germany', 'EUR', 'DE'),
(26, 'Greece', 'EUR', 'GR'),
(27, 'Ireland', 'EUR', 'IE'),
(28, 'Italy', 'EUR', 'IT'),
(29, 'Kosovo', 'EUR', 'KO'),
(30, 'Latvia', 'EUR', 'LV'),
(31, 'Luxembourg', 'EUR', 'LU'),
(32, 'Malta', 'EUR', 'MT'),
(33, 'Monaco', 'EUR', 'MC'),
(34, 'Montenegro', 'EUR', 'ME'),
(35, 'Netherlands', 'EUR', 'NL'),
(36, 'Portugal', 'EUR', 'PT'),
(37, 'San Marino', 'EUR', 'SM'),
(38, 'Slovakia', 'EUR', 'SK'),
(39, 'Slovenia', 'EUR', 'SI'),
(40, 'Spain', 'EUR', 'ES'),
(41, 'Vatican City', 'EUR', 'VA');

INSERT INTO `logo_pricing` (`id`, `country`, `price`, `color_changes`) VALUES
(1, 1, 29.9, 4),
(2, 17, 800, 200);
INSERT INTO `vc_pricing` (`id`, `country`, `finish`, `qty`, `premium`, `back_side`, `super_premium`, `back_side_super_premium`, `std_shipping`, `exp_shipping`) VALUES
(1, 17, 'GLOSS', 100, 175, 210, 210, 252, 0, 50),
(2, 17, 'GLOSS', 250, 450, 540, 540, 648, 0, 100),
(3, 17, 'GLOSS', 500, 600, 720, 720, 864, 0, 100),
(4, 17, 'GLOSS', 1000, 1000, 1200, 1200, 1440, 0, 150),
(5, 17, 'GLOSS', 2500, 2200, 2640, 2640, 3168, 0, 200),
(6, 17, 'GLOSS', 5000, 4400, 5280, 5280, 6336, 0, 250),
(7, 17, 'GLOSS', 7500, 6500, 7800, 7800, 9360, 0, 250),
(8, 17, 'GLOSS', 10000, 8000, 9600, 9600, 11520, 0, 300),
(9, 17, 'GLOSS', 15000, 12000, 14400, 14400, 17280, 0, 300),
(10, 17, 'GLOSS', 20000, 14000, 16800, 16800, 20160, 0, 350),
(11, 17, 'GLOSS', 25000, 17000, 20400, 20400, 24480, 0, 350),
(12, 17, 'MATT', 100, 175, 210, 210, 252, 0, 50),
(13, 17, 'MATT', 250, 450, 540, 540, 648, 0, 100),
(14, 17, 'MATT', 500, 600, 720, 720, 864, 0, 100),
(15, 17, 'MATT', 1000, 1000, 1200, 1200, 1440, 0, 150),
(16, 17, 'MATT', 2500, 2200, 2640, 2640, 3168, 0, 200),
(17, 17, 'MATT', 5000, 4400, 5280, 5280, 6336, 0, 250),
(18, 17, 'MATT', 7500, 6500, 7800, 7800, 9360, 0, 250),
(19, 17, 'MATT', 10000, 8000, 9600, 9600, 11520, 0, 300),
(20, 17, 'MATT', 15000, 12000, 14400, 14400, 17280, 0, 300),
(21, 17, 'MATT', 20000, 14000, 16800, 16800, 20160, 0, 350),
(22, 17, 'MATT', 25000, 17000, 20400, 20400, 24480, 0, 350);


INSERT INTO `vc_pricing` (`id`, `country`, `finish`, `qty`, `premium`, `back_side`, `super_premium`, `back_side_super_premium`, `std_shipping`, `exp_shipping`, `card_design`) VALUES
(66, 1, 'GLOSS', 100, 25.9, 8, 37.5, 8, 0, 4.9, 29),
(67, 1, 'MATT', 100, 25.9, 8, 37.5, 8, 0, 4.9, 29),
(68, 1, 'GLOSS', 250, 31.9, 12, 46.9, 12, 0, 4.9, 29),
(69, 1, 'MATT', 250, 31.9, 12, 46.9, 12, 0, 4.9, 29),
(70, 1, 'GLOSS', 500, 50.9, 15, 74.9, 15, 0, 5.9, 29),
(71, 1, 'MATT', 500, 50.9, 15, 74.9, 15, 0, 5.9, 29),
(72, 1, 'GLOSS', 1000, 56.9, 20, 83.9, 20, 0, 9.9, 29),
(73, 1, 'MATT', 1000, 56.9, 20, 83.9, 20, 0, 9.9, 29),
(74, 1, 'GLOSS', 2500, 102.5, 30, 149, 30, 0, 9.9, 29),
(75, 1, 'MATT', 2500, 102.5, 30, 149, 30, 0, 9.9, 29),
(76, 1, 'GLOSS', 5000, 140.9, 40, 205.9, 40, 0, 9.9, 29),
(77, 1, 'MATT', 5000, 140.9, 40, 205.9, 40, 0, 9.9, 29),
(78, 1, 'GLOSS', 7500, 179.9, 48, 259.9, 48, 0, 19.9, 29),
(79, 1, 'MATT', 7500, 179.9, 48, 259.9, 48, 0, 19.9, 29),
(80, 1, 'GLOSS', 10000, 224.9, 55, 329.9, 55, 0, 19.9, 29),
(81, 1, 'MATT', 10000, 224.9, 55, 329.9, 55, 0, 19.9, 29),
(82, 1, 'GLOSS', 15000, 294.9, 70, 429.9, 70, 0, 19.9, 29),
(83, 1, 'MATT', 15000, 294.9, 70, 429.9, 70, 0, 19.9, 29),
(84, 1, 'GLOSS', 20000, 356.9, 82, 519.9, 82, 0, 19.9, 29),
(85, 1, 'MATT', 20000, 356.9, 82, 519.9, 82, 0, 19.9, 29),
(86, 1, 'GLOSS', 25000, 422.2, 94, 619.9, 94, 0, 19.9, 29),
(87, 1, 'MATT', 25000, 422.9, 94, 619.9, 94, 0, 19.9, 29);
-- end attached script 'script'
