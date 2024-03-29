// Model của thẻ (hõ trợ chức năng nạp tiền)
const mongoose = require('mongoose');
const User = require('../models/users');
const Transaction = require('../models/transaction');
const Wallet = require('../models/wallet');
const crypto = require('crypto');
/**
* Schema cho thẻ cào.
* CardId = STT
* CardNumber = Số
* expiryDate = Ngày hết hạn
* cvv = Mã CVV
*/
const cardSchema = new mongoose.Schema({
  cardId: Number,
  cardNumber: Number,
  expiryDate: Date,
  cvv: Number,
});

// Tạo collection
var Card = mongoose.model('Card', cardSchema);
module.exports = Card;

// thẻ đầu tiên. Không giới hạn số lần nạp và số tiền mỗi lần nạp.
// Vì chỉ có 3 thẻ nên tạo sẵn như này để vào database luôn. Dễ kiểm tra.
module.exports.cardOne = async function () {
  const cardId = 1;
  const cardNumber = 111111;
  const expiryDate = new Date(2022, 10, 10);
  const cvv = 411;
  // Tạo thành array để xử lý (xem các function ở dưới)
  const cardOneDataArray = [cardId, cardNumber, expiryDate, cvv];
  // Lưu thẻ vào database
  const cardOneData = await new Card({
    cardId: cardId,
    cardNumber: cardNumber,
    expiryDate: expiryDate,
    cvv: cvv,
  });

  await cardOneData.save();
  console.log('Đã tạo thẻ 1');
  return cardOneDataArray;
}

// thể thứ hai. Không giới hạn số lần nạp nhưng chỉ được nạp tối đa 1 triệu/lần.
module.exports.cardTwo = async function () {
  const cardId = 2;
  const cardNumber = 222222;
  const expiryDate = new Date(2022, 11, 11);
  const cvv = 443;
  // Tạo thành array để xử lý (xem các function ở dưới)
  const cardTwoDataArray = [cardId, cardNumber, expiryDate, cvv];
  // Lưu thẻ vào database
  const cardTwoData = await new Card({
    cardId: cardId,
    cardNumber: cardNumber,
    expiryDate: expiryDate,
    cvv: cvv,
  });

  await cardTwoData.save();
  console.log('Đã tạo thẻ 2');
  return cardTwoDataArray;
}

// thẻ thứ 3. Khi nạp bằng thẻ này thì luôn nhận được thông báo là “thẻ hết tiền”.
module.exports.cardThree = async function () {
  const cardId = 3;
  const cardNumber = 333333;
  const expiryDate = new Date(2022, 12, 12);
  const cvv = 577;
  // Tạo thành array để xử lý (xem các function ở dưới)
  const cardThreeDataArray = [cardId, cardNumber, expiryDate, cvv];
  // Lưu thẻ vào database
  const cardThreeData = await new Card({
    cardId: cardId,
    cardNumber: cardNumber,
    expiryDate: expiryDate,
    cvv: cvv,
  });

  await cardThreeData.save();
  console.log('Đã tạo thẻ 3');
  return cardThreeDataArray;
}

/**
 * Chức năng nạp tiền.
 * @param {int} cardNumber Số thẻ cào
 * @param {date} expiryDate Ngày hết hạn
 * @param {int} cvv Mã CVV
 * @param {int} amount Số tiền nạp
 * @returns {string} Thông báo nạp thành công hoặc lỗi.
 */
module.exports.recharge = async function (cardNumber, expiryDate, cvv, amount) {
  // Tạo bằng new Date bị lỗi.
  let cardOneExpiryDate = "2022-10-10";
  let cardTwoExpiryDate = "2022-11-11";
  let cardThreeExpiryDate = "2022-12-12";
  let transactionId = crypto.randomBytes(16).toString('hex');

  expiryDate.toString();
  if (cardNumber != null && cardNumber.length != 6) return 'Card Number must be 6 digits';
  if (cvv != null && cvv.length != 3) return 'CVV must be 3 digits';

  // Thẻ 1 không giới hạn.
  if (cardNumber == 111111) {
    if (expiryDate != cardOneExpiryDate) return 'Invalid date';
    if (cvv != 411) return 'Invalid CVV';

    await User.findOneAndUpdate({ $inc: { balance: amount } });
    await Transaction.create({
      // userId:
      transactionId: transactionId,
      amount: amount,
      type: 'recharge',
      status: 'approved',
    });
    return 'Success';
  }

  // Thẻ 2 nạp tối đa 1 triệu/lần.
  if (cardNumber == 222222) {
    if (expiryDate != cardTwoExpiryDate) return 'Invalid date';
    if (cvv != 443) return 'CVV must be 3 digits';
    if (amount > 1000000) return 'Amount must be less than 1 million';

    await User.findOneAndUpdate({ $inc: { balance: amount } });
    await Transaction.create({
      transactionId: transactionId,
      amount: amount,
      type: 'recharge',
      status: 'approved',
    });
    return 'Success';
  }

  // Thẻ 3 luôn hết tiền.
  if (cardNumber == 333333) {
    if (expiryDate != cardThreeExpiryDate) return 'Invalid date';
    if (cvv != 577) return 'Invalid CVV';
    return 'This card is out of money';
  }

  // Nếu nhập cardNumber 6 chữ số nhưng không phải 3 cái trên thì hiện "thẻ này không được hỗ trợ".
  return 'This card is not supported';
}


/**
 * Chức năng rút tiền
 * @param {int} cardNumber Số thẻ cào
 * @param {date} expiryDate Ngày hết hạn
 * @param {int} cvv Mã
 * @param {int} amount Số tiền rút
 * @param {string} description Ghi chú
 * @returns {string} Thông báo rút tiền thành công hoặc lỗi.
 */
module.exports.withdraw = async function (cardNumber, expiryDate, cvv, amount, description) {
  // Tính năng mô phỏng => chỉ cần rút từ thẻ đầu tiên nên set cứng luôn.
  // Tạo ngày bằng new Date bị lỗi.
  let defaultExpiryDate = "2022-10-10";
  let transactionId = crypto.randomBytes(16).toString("hex");

  if (cardNumber == 111111 && expiryDate == defaultExpiryDate && cvv == 411) {
    //************ const user = await User.findOne({ userId: user.id });
    // Đếm số lần rút tiền của hôm nay.
    const count = await Transaction.countDocuments({
      //********* userId: user.id,
      // Lấy ngày hôm nay.
      date: new Date(new Date().toDateString()),
      type: 'withdraw',
    }).count();
    if (count > 2) return 'You have reached the limit of withdrawals today';
    // Nếu chưa đến giới hạn rút tiền thì tiến hành rút tiền.
    else {
      //**********************************if (amount > user.balance) return 'Insufficient balance';
      if (amount > 5000000) {
        await Transaction.create({
          //***********************userId: user.id,
          transactionId: transactionId,
          amount: amount,
          type: 'withdraw',
          description: description,
          status: 'pending',
        });
        return 'Pending request';
      }
      // Không thể bỏ vòng else này vì nó sẽ bị lỗi khi số tiền vừa > 5,000,000 mà còn không chia hết cho 50,000.
      else {
        if (amount % 50000 != 0) return 'The amount must be a multiple of 50,000';
        // 5% phí rút tiền
        /**********************user.balance -= amount * 0.95;
        await user.save();*************************/
        // Ghi nhận vào lịch sử giao dịch
        await Transaction.create({
          //*********************************userId: user.id,
          transactionId: transactionId,
          type: 'withdraw',
          amount: amount,
          description: description,
          status: 'approved',
        });
        return 'Success';
      }
    }
  } else if (cardNumber == 222222 || cardNumber == 333333) return 'This card is not supported';
  else return 'Invalid card';
}
