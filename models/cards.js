// Model của thẻ (hõ trợ chức năng nạp tiền)
const mongoose = require('mongoose');
const User = require('../models/users');
const Transaction = require('../models/transaction');
/**
  * Đọc tài liệu của thầy để biết tại sao có cái này.
  * CardId = STT
  * CardNumber = Số
  * expiryDate = Ngày hết hạn
  * cvv = Mã CVV
  **/
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

// Chức năng nạp tiền.
module.exports.recharge = async function (cardId, cardNumber, expiryDate, cvv, amount) {
  var cardOneExpiryDate = new Date(2022, 10, 10);
  var cardTwoExpiryDate = new Date(2022, 11, 11);
  var cardThreeExpiryDate = new Date(2022, 12, 12);

  if (cardNumber.length != 6) {
    return 'Số thẻ không hợp lệ';
  }

  if (cvv.length != 3) {
    return 'Mã CVV không hợp lệ';
  }

  // Thẻ 1 không giới hạn.
  if (cardNumber == 111111) {
    if (expiryDate.getTime() != cardOneExpiryDate.getTime()) {
      return 'Thời hạn thẻ không hợp lệ';
    }

    if (cvv != 411) {
      return 'Mã CVV không hợp lệ';
    }

    const user = await User.findOne({ userId: user.id });
    user.balance += amount;
    await user.save();
    return 'Nạp tiền thành công';
  }

  // Thẻ 2 nạp tối đa 1 triệu/lần.
  if (cardNumber == 222222) {
    if (expiryDate.getTime() != cardTwoExpiryDate.getTime()) {
      return 'Thời hạn thẻ không hợp lệ';
    }
    if (cvv != 443) {
      return 'Mã CVV không hợp lệ';
    }

    if (amount > 1000000) {
      return 'Không thể nạp quá 1 triệu';
    }

    const user = await User.findOne({ userId: user.id });
    user.balance += amount;
    await user.save();
    return 'Nạp tiền thành công';
  }

  // Thẻ 3 luôn hết tiền.
  if (cardNumber == 333333) {
    if (expiryDate.getTime() != cardThreeExpiryDate.getTime()) {
      return 'Thời hạn thẻ không hợp lệ';
    }
    if (cvv != 577) {
      return 'Mã CVV không hợp lệ';
    }

    return 'Thẻ hết tiền';
  }

  // Nếu nhập cardNumber 6 chữ số nhưng không phải 3 cái trên thì hiện "thẻ này không được hỗ trợ".
  return 'Thẻ này không được hỗ trợ';
}