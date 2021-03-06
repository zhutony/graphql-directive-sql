CREATE TABLE `dbname`.`test_User` (
  `userId` BINARY(16) NOT NULL,
  `uniqueColumn` INT NOT NULL UNIQUE,
  `databaseOnlyField` INT NOT NULL,
  PRIMARY KEY (`userId`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dbname`.`test_Post` (
  `postId` INT NOT NULL AUTO_INCREMENT,
  `userId` BINARY(16) NOT NULL,
  `content` VARCHAR(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `likes` INT NOT NULL,
  `dateCreated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`postId`),
  INDEX `USERIDINDEX` (`userId` ASC)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dbname`.`test_UserPair` (
  `userPairId` BINARY(16) NOT NULL,
  `parentUserId` BINARY(16) NOT NULL,
  `childUserId` BINARY(16) NOT NULL,
  PRIMARY KEY (`userPairId`),
  INDEX `PARENTUSERIDINDEX` (`parentUserId` ASC),
  INDEX `CHILDUSERIDINDEX` (`childUserId` ASC),
  UNIQUE(parentUserId, childUserId),
  FOREIGN KEY (parentUserId) REFERENCES User(userId)
);