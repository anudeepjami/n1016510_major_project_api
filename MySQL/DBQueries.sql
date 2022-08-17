-- create database majorproject;
-- use majorproject;

SET SQL_SAFE_UPDATES = 0;

CREATE TABLE crowdfunding_data (
    wallet_address VARCHAR(255) NOT NULL,
    email_id VARCHAR(255)
);

select * from crowdfunding_data;

-- INSERT INTO crowdfunding_data(wallet_address,email_id) VALUES ('0x873c0aC51ba295b1834bD8Ca93B77491D34eA128','anudeep.jami@gmail.com');
-- INSERT INTO crowdfunding_data(wallet_address,email_id) VALUES ('0x0183c0B7C6a28572Fd97e19E4E25e4dFF347C8ee','jami.anudeep@gmail.com');

-- UPDATE crowdfunding_data SET email_id = 'anudeep.jami@gmail.com' WHERE wallet_address = "0x0183c0B7C6a28572Fd97e19E4E25e4dFF347C8ee";
-- UPDATE crowdfunding_data SET email_id = 'jami.anudeep@gmail.com' WHERE wallet_address = "0x0183c0B7C6a28572Fd97e19E4E25e4dFF347C8ee";