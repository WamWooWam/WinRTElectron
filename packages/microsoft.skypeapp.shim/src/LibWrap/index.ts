
import { VectBool, VectInt, VectUnsignedInt, VectGIString, VectGIFilename } from "./Vect"
import { WrSkyLib } from "./WrSkyLib"
import { Conversation } from "./Conversation"
import { UIEventRunner, UIEventContext } from "./UIEventRunner"
import { AvatarManager } from "./AvatarManager"
import { Message } from "./Message"
import { PROPKEY } from "./PROPKEY"
import { Contact } from "./Contact"
import { RecentsQuery } from "./VM/RecentsQuery"
import { UnreadCountQuery } from "./VM/UnreadCountQuery"
import { Transfer } from "./Transfer"
import { Video } from "./Video"
import { AccountManager } from "./AccountManager"
import { IMCache } from "./ImCache"
import { Setup } from "./Setup"
import { Account } from "./Account"
import { Filename } from "./Filename"
import { StatsEventAttributeContainer, StatsClickStreamEvents, StatsWin8Events, StatsHardwareInventoryInfo } from "./StatsEventAttributeContainer"

export const LibWrap = {
    VectBool,
    VectInt,
    VectUnsignedInt,
    VectGIString,
    VectGIFilename,
    WrSkyLib,
    Conversation,
    UIEventRunner,
    UIEventContext,
    AvatarManager,
    AccountManager,
    Message,
    PROPKEY,
    Contact,
    Transfer,
    Video,
    IMCache,
    Setup,
    Account,
    Filename,
    StatsEventAttributeContainer,
    StatsClickStreamEvents,
    StatsWin8Events,
    StatsHardwareInventoryInfo,
    VM: {
        RecentsQuery,
        UnreadCountQuery
    }
}