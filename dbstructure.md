webRunes_Users table creation statement

CREATE TABLE `webRunes_Users` (
  `wrioID` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `facebookID` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `titterID` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `profileURI` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'n/a',
  `signInDate` datetime DEFAULT NULL,
  `lastVisitDate` datetime DEFAULT NULL,
  `invitedBy` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'n/a',
  `userID` int(36) NOT NULL AUTO_INCREMENT,
  `lastName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `firstName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `token` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tokenSecret` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `balance` int(36) NOT NULL DEFAULT '0',
  PRIMARY KEY (`userID`),
  UNIQUE KEY `facebookID` (`facebookID`),
  UNIQUE KEY `titterID` (`titterID`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;