import React, { useState } from "react";
import axios from "axios";
import classes from "./customerService.module.css";

export default function CustomerService() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    setStatusType("info");

    try {
      await axios.post("http://localhost:8801/service/send-email", form);
      setStatus("Message sent successfully!");
      setStatusType("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("Failed to send message. Please try again.");
      setStatusType("error");
    }
  };

  const getAlertClass = () => {
    const baseClass = classes.alert;
    switch (statusType) {
      case "success":
        return `${baseClass} ${classes.alertSuccess}`;
      case "error":
        return `${baseClass} ${classes.alertError}`;
      default:
        return `${baseClass} ${classes.alertInfo}`;
    }
  };

  return (
    <div className={classes.customerServiceContainer}>
      <div className={classes.formContainer}>
        <h2 className={classes.title}>Need Help? Contact Us</h2>
        <form onSubmit={handleSubmit} className={classes.form}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            className={classes.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
            className={classes.input}
          />
          <textarea
            name="message"
            placeholder="How can we help you?"
            value={form.message}
            onChange={handleChange}
            required
            className={classes.textarea}
          ></textarea>
          <button type="submit" className={classes.button}>
            Send Message
          </button>
        </form>
        {status && <div className={getAlertClass()}>{status}</div>}
      </div>
    </div>
  );
}
