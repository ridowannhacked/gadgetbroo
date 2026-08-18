const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

// Update Order model
schema = schema.replace(
`  userId                String
  user                  User          @relation(fields: [userId], references: [id])
  addressId             String
  address               Address       @relation(fields: [addressId], references: [id])`,
`  userId                String?
  user                  User?         @relation(fields: [userId], references: [id])
  addressId             String?
  address               Address?      @relation(fields: [addressId], references: [id])
  customerName          String?
  customerPhone         String?
  customerAddress       String?       @db.Text
  orderSource           OrderSource   @default(ONLINE)`
);

// Add OrderSource enum and update PaymentMethod
schema = schema.replace(
`enum PaymentMethod {
  STRIPE
  CASH_ON_DELIVERY
}`,
`enum OrderSource {
  ONLINE
  POS
  SOCIAL_MEDIA
}

enum PaymentMethod {
  STRIPE
  CASH_ON_DELIVERY
  CASH
  MANUAL_BKASH
}`
);

// Update ProductVariant (we will DROP color, size, storage completely since we are generating SQL and we will add UPDATE statement before DROP)
schema = schema.replace(
`  color      String?
  size       String?
  storage    String?`,
`  attributes Json?       @default("{}")`
);

fs.writeFileSync("prisma/schema.prisma", schema);
console.log("Schema patched successfully.");
