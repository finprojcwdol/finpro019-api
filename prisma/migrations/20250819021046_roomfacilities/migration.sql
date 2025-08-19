-- CreateTable
CREATE TABLE "_RoomFacilitiesOnRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoomFacilitiesOnRooms_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RoomFacilitiesOnRooms_B_index" ON "_RoomFacilitiesOnRooms"("B");

-- AddForeignKey
ALTER TABLE "_RoomFacilitiesOnRooms" ADD CONSTRAINT "_RoomFacilitiesOnRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomFacilitiesOnRooms" ADD CONSTRAINT "_RoomFacilitiesOnRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "RoomFacilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
