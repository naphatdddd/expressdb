const bcryptjs = require("bcryptjs");
const models = require("../models/index");

exports.index = async function (req, res, next) {
  // const sql = "select id,name,email,create_at from users order by id desc";
  // const users = await models.User.findAll({
  // const users = await models.sequelize.query(sql, {
  //   type: models.sequelize.QueryTypes.SELECT,
  //   // attributes: ["id", "name", "email",'create_at'],
  //   // order: [["id", "desc"]],
  //   // attributes: {exclude: ['password']},
  //   // order: [["id", "desc"]],
  //   // attributes: { exclude: ["password"] },
  //   // where: {
  //   //   email: 'naphat.d@gmail.com',
  //   // },
  //   // order: [["id", "desc"]],
  //   // attributes: ["id", "name", ["email",'username'],'create_at'],
  //   // order: [["id", "desc"]],
  // });
  const users = await models.User.findAll({
    attributes: { exclude: ["password"] },
    include: [
      {
        model: models.Blog,
        as: "blogs",
        attributes: ["id", "title"],
      },
    ],
    order: [["id", "desc"],['blogs','id','desc']],
  });
  res.status(200).json({ data: users });
};

exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await models.User.findByPk(id, {
      attributes: ["id", "name", "email", "create_at"],
    });
    if (!user) {
      const error = new Error("not user");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
  }
};

exports.insert = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //check email
    const existEmail = await models.User.findOne({ where: { email: email } });

    if (existEmail) {
      const error = new Error("email ready");
      error.statusCode = 400;
      throw error;
    }
    //hash password

    const salt = await bcryptjs.genSalt(8);
    const passwordHash = await bcryptjs.hash(password, salt);

    //insert user
    const user = await models.User.create({
      name: name,
      email: email,
      password: passwordHash,
    });

    res.status(201).json({
      message: "success data",
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id, name, email, password } = req.body;
    if (req.params.id !== id) {
      const error = new Error("not password");
      error.statusCode = 400;
      throw error;
    }
    //check email
    // const existEmail = await models.User.findOne({ where: { email: email } });

    // if (existEmail) {
    //   const error = new Error("email ready");
    //   error.statusCode = 400;
    //   throw error;
    // }
    //hash password

    const salt = await bcryptjs.genSalt(8);
    const passwordHash = await bcryptjs.hash(password, salt);

    //insert user
    const user = await models.User.update(
      {
        name: name,
        email: email,
        password: passwordHash,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.status(200).json({
      message: "success edit data",
      // data: {
      //   id: user.id,
      //   email: user.email,
      // },
    });
  } catch (error) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await models.User.findByPk(id);
    if (!user) {
      const error = new Error("not user");
      error.statusCode = 404;
      throw error;
    }

    await models.User.destroy({
      where: {
        id: id,
      },
    });

    res.status(200).json({
      message: "success delete",
    });
  } catch (error) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
  }
};
