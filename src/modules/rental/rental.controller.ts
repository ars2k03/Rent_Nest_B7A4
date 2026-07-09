import type { Request, Response } from "express";
import * as RentalService from "./rental.service.js";

export const createRental = async (req: Request, res: Response) => {
  const result = await RentalService.createRentalService(req.body);

  res.status(201).json({
    success: true,
    message: "Rental request submitted successfully",
    data: result,
  });
};

export const getMyRentals = async (req: Request, res: Response) => {
  const result = await RentalService.getAllRentalService();

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getSingleRental = async (req: Request, res: Response) => {
  const result = await RentalService.getSingleRentalService(req.params.id as string);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const updateRentalStatus = async (req: Request, res: Response) => {
  const result = await RentalService.updateRentalStatusService(
    req.params.id as string,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Rental status updated successfully",
    data: result,
  });
};