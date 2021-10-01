import * as dotenv from "dotenv";
dotenv.config();
import { Application, Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import express, { Express } from "express";
import { Product, Review } from ".prisma/client";
import {} from "@prisma/client/runtime";
const prisma = new PrismaClient();
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

// Needed for a mutually exclusive Union to exist (XOR)
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
let args: any;
const reviewFindUnique = ({
  id,
  text,
  rating,
  product,
  description,
  name,
  price,
  reviews
}: {
  id: string;
  text: string;
  rating: number;
  product: Prisma.ProductCreateNestedOneWithoutReviewsInput;
  name: string;
  description: string;
  price: number;
  reviews?: Prisma.ReviewCreateNestedManyWithoutProductInput | undefined;
}) => {
  return Prisma.validator<
    Prisma.ProductCreateInput extends Prisma.ReviewCreateInput
      ? Prisma.ProductCreateInput & Prisma.ReviewCreateInput
      : Prisma.ProductCreateInput & Partial<Prisma.ReviewCreateInput>
  >()({
    description,
    name,
    price,
    text,
    rating,
    id,
    product: {
      create: ({ id, description, name, price } as typeof product) || [
        { id, description, price, name }
      ]
    } as
      | {
          create:
            | {
                id: string | undefined;
                description: string;
                name: string;
                price: number;
              }
            | {
                id?: string | undefined;
                name: string;
                description: string;
                price: number;
              }
            | {
                id: string | undefined;
                description: string;
                name: string;
                price: number;
              }
            | {
                id?: string | undefined;
                name: string;
                description: string;
                price: number;
              }
            | undefined;
        }
      | undefined,
    reviews: {
      create: {
        rating: rating,
        id: String(id ?? ""),
        text: text
      }
    }
  });
};
/**
 * 
 * //   createMany: {
    //     data: [{ id: String(id ?? ""), rating, text }]
    //   },
    //   connect: { id: String((id as string) ?? "") },
    //   connectOrCreate: {
    //     where: { id: id as string | undefined }
    //   }
    // } || {
    //   create: { text, id: String(id ?? ""), rating }
    // }
 */

const expressWrapper = async (app: Application) => {
  app.use(express.json());

  app.get("/ping", (_req: Request, res: Response) => {
    res.json({ message: "hello" });
  });

  app.get("/products", async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany({
      select: {
        name: true,
        reviews: {
          select: {
            id: true,
            text: true,
            rating: true
          }
        }
      }
    });

    res.json(products);
  });

  app.post("/products", async (req: Request, res: Response) => {
    const { body } = req;
    const id = args as Prisma.ProductScalarFieldEnum;

    const product: Product =
      await prisma.product.create<Prisma.ProductCreateArgs>({
        include: { reviews: true },
        data: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price
        }
      });

    res.json(product);
  });
  const { id } = Prisma.ProductScalarFieldEnum;
  const { where, include, select, rejectOnNotFound } =
    args as Prisma.ReviewFindUniqueArgs;
  app.get("/reviews", async (req: Request, res: Response) => {
    const { body } = req;
    const review = await prisma.review.findUnique({
      where: {
        id: String(id as string)
      },
      select: {
        id: true,
        product: true
      }
    });

    res.json(review?.product);
  });

  const PORT = 3001;
  app.listen(PORT);
  console.log(`Listening on http://localhost:${PORT}/reviews`);
};

// @ts-ignore
// @ts-nocheck
expressWrapper({ express(); });
