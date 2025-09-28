{\rtf1\ansi\ansicpg950\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // Serverless function: create a Stripe Checkout session\
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);\
\
// \uc0\u23567 \u24037 \u20855 \u65306 \u23433 \u20840 \u35299 \u26512  JSON\
function safeJson(body) \{\
  try \{ return JSON.parse(body || '\{\}'); \} catch \{ return \{\}; \}\
\}\
\
exports.handler = async (event) => \{\
  if (event.httpMethod !== 'POST') \{\
    return \{ statusCode: 405, body: 'Method Not Allowed' \};\
  \}\
\
  const \{ amountEUR, orderNo, name, email \} = safeJson(event.body);\
  if (!amountEUR) \{\
    return \{ statusCode: 400, body: 'Missing amountEUR' \};\
  \}\
\
  const amountInCents = Math.round(parseFloat(amountEUR) * 100);\
\
  try \{\
    const session = await stripe.checkout.sessions.create(\{\
      mode: 'payment',\
      currency: 'eur',\
      payment_method_types: ['card'],\
      customer_email: email || undefined,\
      // \uc0\u19968 \u31558 \u37329 \u38989 \u65288 \u20381 \u20320 \u21069 \u31471 \u24050 \u31639 \u22909 \u30340 \u32317 \u20729 \u65289 \
      line_items: [\{\
        quantity: 1,\
        price_data: \{\
          currency: 'eur',\
          unit_amount: amountInCents,\
          product_data: \{\
            name: `Hand-painted postcard \'96 Order $\{orderNo || 'N/A'\}`\
          \}\
        \}\
      \}],\
      metadata: \{\
        orderNo: orderNo || '',\
        customerName: name || ''\
      \},\
      success_url: `$\{process.env.SUCCESS_URL || 'https://YOUR_SITE.netlify.app'\}?paid=1&order=$\{encodeURIComponent(orderNo || '')\}`,\
      cancel_url: `$\{process.env.CANCEL_URL || 'https://YOUR_SITE.netlify.app'\}?paid=0&order=$\{encodeURIComponent(orderNo || '')\}`\
    \});\
\
    return \{\
      statusCode: 200,\
      body: JSON.stringify(\{ url: session.url \})\
    \};\
  \} catch (err) \{\
    return \{\
      statusCode: 500,\
      body: JSON.stringify(\{ error: err.message \})\
    \};\
  \}\
\};\
}