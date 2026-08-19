"use client";

import React from "react";
import { Mail, MessageCircle, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Contact Support</h2>
        <p className="text-sm text-gray-500">We're here to help. Choose a channel or send us a message.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cards */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <Mail size={20} />
          </div>
          <h3 className="font-bold text-gray-900">Email Us</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Get a response within 24 hours.</p>
          <a
            href="mailto:support@evidcheck.com"
            className="text-[#188015] hover:underline font-semibold"
          >
            support@evidcheck.com
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
            <MessageCircle size={20} />
          </div>
          <h3 className="font-bold text-gray-900">Live Chat</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Chat with our team in real-time.</p>
          <button className="text-sm font-medium text-secondary hover:underline">
            Start Chat
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
            <Phone size={20} />
          </div>
          <h3 className="font-bold text-gray-900">Phone Support</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Mon-Fri from 8am to 5pm EST.</p>
          <a
            href="tel:+15551234567"
            className="text-sm font-medium text-secondary hover:underline"
          >
            +1 (555) 123-4567
          </a>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Send us a message</h3>
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input id="contact-name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" placeholder="your@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input id="contact-subject" placeholder="How can we help?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              rows={4}
              className="resize-none"
              placeholder="Describe your issue..."
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 text-center sm:text-left">
              <Clock size={14} className="shrink-0" />
              <span>Average response time: 2 hours</span>
            </div>
            <Button className="w-full sm:w-auto bg-secondary text-white hover:bg-gray-800">
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
