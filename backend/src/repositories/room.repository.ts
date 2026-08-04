import { RoomModel } from '../models/Room';
import { IRoom, IRoomDocument } from '../interfaces/room.interface';

export class RoomRepository {
  async findAll(): Promise<IRoomDocument[]> {
    return RoomModel.find({}).sort({ name: 1 }).lean<IRoomDocument[]>().exec();
  }

  async findById(id: string): Promise<IRoomDocument | null> {
    return RoomModel.findById(id).lean<IRoomDocument>().exec();
  }

  async findByName(name: string): Promise<IRoomDocument | null> {
    return RoomModel.findOne({ name }).lean<IRoomDocument>().exec();
  }

  async create(roomData: IRoom): Promise<IRoomDocument> {
    const room = new RoomModel(roomData);
    return room.save();
  }

  async count(): Promise<number> {
    return RoomModel.countDocuments();
  }
}
