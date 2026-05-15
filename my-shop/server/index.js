const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { CloudinaryStorage } =
  require("multer-storage-cloudinary");

const cloudinary =
  require("cloudinary").v2;

const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Message = require("./models/Message");

const app = express();
cloudinary.config({

  cloud_name: "dslszvo6q",

  api_key: "376598822626213",

  api_secret: "IfT1MpJUStPJCPcvviGQbAYPIh8"
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static("client"));
app.use("/uploads", express.static("uploads"));

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: {

      folder: "my-shop",

      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "webp"
      ]
    }
});

const upload = multer({ storage });

mongoose.connect(
  "mongodb+srv://monami:kotikivampiry@cluster0.pornaxn.mongodb.net/?retryWrites=true&w=majority"
)
.then(() => {
  console.log("База подключена");
})
.catch(err => {
  console.log("Mongo ошибка:", err);
});

app.get("/", (req, res) => {
  res.send("Сервер работает");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Пользователь уже существует"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hash
    });

    await user.save();

    res.json({
      message: "Пользователь создан"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.status(400).json({
        message:
          "Пользователь не найден"
      });
    }


    if (user.banned === true) {

      return res.status(403).json({
        message:
          "Ваш аккаунт заблокирован"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        message:
          "Неверный пароль"
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

app.put("/users/:id/name", async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    res.json({
      message: "Имя изменено",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/upload", upload.single("image"), (req, res) => {

  try {

    res.json({

      message: "Фото загружено",

      imageUrl: req.file.path
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/add-product", async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      images,
      category,
      city,
      status,
      article,
      brand,
      color,
      size,
      condition,
      user
    } = req.body;

    const mainImage =
      images && images.length > 0
        ? images[0]
        : "";

    const product = new Product({
      title,
      price,
      description,
      image: mainImage,
      images: images || [],
      category,
      city,
      status: status || "В наличии",
      article: article || "",
      brand: brand || "",
      color: color || "",
      size: size || "",
      condition: condition || "Новое",
      user
    });

    await product.save();

    res.json({
      message: "Товар добавлен"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});
app.delete("/admin/reviews/:productId/:reviewId", async (req, res) => {

  try {

    const product =
      await Product.findById(
        req.params.productId
      );

    if (!product) {

      return res.status(404).json({
        message: "Товар не найден"
      });
    }

    product.reviews.pull({

      _id:
        req.params.reviewId

    });

    await product.save();

    res.json({
      message: "Отзыв удалён"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

app.delete("/admin/reviews/:productId/:reviewId", async (req, res) => {

  try {

    const product =
      await Product.findById(req.params.productId);

    if (!product) {

      return res.status(404).json({
        message: "Товар не найден"
      });
    }

    product.reviews =
      product.reviews.filter(
        r => r._id.toString() !== req.params.reviewId
      );

    await product.save();

    res.json({
      message: "Отзыв удалён"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });
  }
});
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    res.json(product);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/products/:id/reviews", async (req, res) => {
  try {
    const { userName, text, rating } = req.body;

    const product = await Product.findById(req.params.id);

    product.reviews.push({
      userName,
      text,
      rating
    });

    await product.save();

    res.json({
      message: "Отзыв добавлен"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/my-products/:email", async (req, res) => {
  try {
    const products = await Product.find({
      "user.email": req.params.email
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      category,
      city,
      status,
      article,
      brand,
      color,
      size,
      condition,
      images
    } = req.body;

    const updateData = {
      title,
      price,
      description,
      category,
      city,
      status,
      article,
      brand,
      color,
      size,
      condition
    };

    if (images && images.length > 0) {
      updateData.images = images;
      updateData.image = images[0];
    }

    await Product.findByIdAndUpdate(
      req.params.id,
      updateData
    );

    res.json({
      message: "Товар обновлён"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

app.put("/products/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await Product.findByIdAndUpdate(
      req.params.id,
      { status }
    );

    res.json({
      message: "Статус обновлён"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Товар удалён"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.post("/create-order", async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      status: "Новый"
    });

    await order.save();
   

for (const item of order.items) {

  if (!item.user) continue;

  const notifyMessage = new Message({

    sender: {
      name: order.name,
      email: order.user?.email || "unknown"
    },

    receiver: {
      name: item.user.name,
      email: item.user.email
    },

    product: {
      id: item._id,
      title: item.title,
      image:
        item.images && item.images.length > 0
          ? item.images[0]
          : item.image
    },

      text:
       `🛒 Новый заказ!<br><br>

        👤 Покупатель: ${order.name}<br>

        📦 Товар: ${item.title}<br>

        📞 Телефон: ${order.phone}<br>

        📍 Адрес: ${order.address}<br>

        💰 Сумма заказа: ${order.total} ₸`,
    isRead: false
  });

  await notifyMessage.save();
}

    res.json({
      message: "Заказ создан"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/my-orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({
      "user.email": req.params.email
    });

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await Order.findByIdAndUpdate(
      req.params.id,
      { status }
    );

    res.json({
      message: "Статус обновлён"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.delete("/orders/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: "Заказ удалён"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/admin/stats", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const orders = await Order.find();

    const ordersCount = orders.length;

    let totalSales = 0;
    let newOrders = 0;
    let finishedOrders = 0;

    orders.forEach(order => {
      totalSales += Number(order.total) || 0;

      if (order.status === "Новый") {
        newOrders++;
      }

      if (
        order.status === "Завершен" ||
        order.status === "Завершён"
      ) {
        finishedOrders++;
      }
    });

    res.json({
      usersCount,
      productsCount,
      ordersCount,
      totalSales,
      newOrders,
      finishedOrders
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


app.post("/messages", async (req, res) => {
  try {
    const {
      sender,
      receiver,
      product,
      text
    } = req.body;

    if (!sender || !receiver || !product || !text) {
      return res.status(400).json({
        message: "Не все данные заполнены"
      });
    }

    const message = new Message({
      sender,
      receiver,
      product,
      text,
      isRead: false
    });

    await message.save();

    res.json({
      message: "Сообщение отправлено"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});



app.get("/messages/chat", async (req, res) => {
  try {
    const {
      user1,
      user2,
      productId
    } = req.query;

    const messages = await Message.find({
      "product.id": productId,
      $or: [
        {
          "sender.email": user1,
          "receiver.email": user2
        },
        {
          "sender.email": user2,
          "receiver.email": user1
        }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});



app.get("/messages/dialogs/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const messages = await Message.find({
      $or: [
        { "sender.email": email },
        { "receiver.email": email }
      ]
    }).sort({ createdAt: -1 });

    const dialogsMap = {};

    messages.forEach(msg => {
      const productId = msg.product.id;

      const otherUser =
        msg.sender.email === email
          ? msg.receiver
          : msg.sender;

      const key = productId + "_" + otherUser.email;

      if (!dialogsMap[key]) {
        dialogsMap[key] = {
          product: msg.product,
          otherUser,
          lastMessage: msg.text,
          lastDate: msg.createdAt,
          unread: 0
        };
      }

      if (
        msg.receiver.email === email &&
        msg.isRead === false
      ) {
        dialogsMap[key].unread++;
      }
    });

    res.json(Object.values(dialogsMap));

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});



app.get("/messages/unread/:email", async (req, res) => {
  try {
    const count = await Message.countDocuments({
      "receiver.email": req.params.email,
      isRead: false
    });

    res.json({
      unread: count
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});



app.put("/messages/read", async (req, res) => {
  try {
    const {
      userEmail,
      otherEmail,
      productId
    } = req.body;

    await Message.updateMany(
      {
        "product.id": productId,
        "sender.email": otherEmail,
        "receiver.email": userEmail
      },
      {
        isRead: true
      }
    );

    res.json({
      message: "Сообщения прочитаны"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.get("/users", async (req, res) => {

  try {

    const users =
      await User.find();

    res.json(users);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});


app.delete("/users/:id", async (req, res) => {

  try {

    await User.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Пользователь удалён"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});

app.put("/users/:id/ban", async (req, res) => {

  try {

    await User.findByIdAndUpdate(
      req.params.id,
      {
        banned: true
      }
    );

    res.json({
      message:
        "Пользователь заблокирован"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});



app.put("/users/:id/unban", async (req, res) => {

  try {

    await User.findByIdAndUpdate(
      req.params.id,
      {
        banned: false
      }
    );

    res.json({
      message:
        "Пользователь разблокирован"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
});
io.on("connection", (socket) => {

  console.log("Пользователь подключился");

  
  socket.on("joinChat", (room) => {

    socket.join(room);

    console.log("Подключился к комнате:", room);
  });

  
  socket.on("sendMessage", (messageData) => {

    io.to(messageData.room).emit(
      "newMessage",
      messageData
    );
  });


  socket.on("disconnect", () => {

    console.log("Пользователь отключился");
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    "Сервер запущен на " + PORT
  );
});