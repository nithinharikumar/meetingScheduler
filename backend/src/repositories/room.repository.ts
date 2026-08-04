import { RoomModel } from '../models/Room';
import { IRoom, IRoomDocument } from '../interfaces/room.interface';

export class RoomRepository {
  async findAll(): Promise<IRoomDocument[]> {
    return RoomModel.find({}, 'name capacity description')
      .sort({ name: 1 })
      .lean<IRoomDocument[]>()
      .exec();
  }

  async findById(id: string): Promise<IRoomDocument | null> {
    return RoomModel.findById(id, 'name capacity description')
      .lean<IRoomDocument>()
      .exec();
  }

  async findByName(name: string): Promise<IRoomDocument | null> {
    return RoomModel.findOne({ name }, 'name capacity description')
      .lean<IRoomDocument>()
      .exec();
  }

  async create(roomData: IRoom): Promise<IRoomDocument> {
    const room = new RoomModel(roomData);
    return room.save();
  }

  async update(id: string, data: Partial<IRoom>): Promise<IRoomDocument | null> {
    return RoomModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .lean<IRoomDocument>()
      .exec();
  }

  async delete(id: string): Promise<IRoomDocument | null> {
    return RoomModel.findByIdAndDelete(id).lean<IRoomDocument>().exec();
  }

  async count(): Promise<number> {
    return RoomModel.countDocuments();
  }
}
