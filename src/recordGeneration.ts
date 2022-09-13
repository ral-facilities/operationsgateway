import {
  Record,
  RecordMetadata,
  ScalarMetadata,
  ChannelMetadata,
  FullChannelMetadata,
  DataType,
  ScalarChannel,
  Channel,
} from './app.types';

export const resultsPerPage = 25;

let channelMetadata: FullChannelMetadata[] = [];

export const generateRecordCollection = (): Record[] => {
  channelMetadata = [];

  const records: Record[] = [];
  const random = randomNumber(resultsPerPage * 3, resultsPerPage * 10);

  for (let i = 0; i < random; i++) {
    records.push(generateRecord());
  }

  return records;
};

export const getFullChannelMetadata = () => channelMetadata;

const generateFullChannelMetadata = (
  channelName: string,
  dataType: DataType
): FullChannelMetadata => {
  const channelMetadata: FullChannelMetadata = {
    systemName: channelName,
    channel_dtype: dataType,
    // give some friendly names, but leave some without to test word wrap
    userFriendlyName:
      Math.random() < 0.5 ? channelName.split('_').join(' ') : undefined,
    description: `${channelName} description`,
    units: `${channelName} units`,
  };
  if (channelMetadata.channel_dtype === 'scalar') {
    channelMetadata.significantFigures = randomNumber(1, 5);
    channelMetadata.scientificNotation = Math.random() < 0.5;
  }
  return channelMetadata;
};

const generateRecord = (): Record => {
  return {
    id: randomNumber(100, 999).toString(),
    metadata: generateRecordMetadata(),
    channels: generateChannels(),
  };
};

const generateRecordMetadata = (): RecordMetadata => {
  return {
    dataVersion: randomNumber(100, 999).toString(),
    shotnum: randomNumber(100, 999),
    timestamp: randomDate().getTime().toString(),
    activeArea: randomNumber(100, 999).toString(),
    activeExperiment: randomNumber(100, 999).toString(),
  };
};

const generateChannels = (): { [channel: string]: Channel } => {
  let returnedObject = {};
  const random = randomNumber(3, 6);

  for (let i = 0; i < random; i++) {
    const newChannel: ScalarChannel = {
      metadata: generateChannelMetadata(),
      data: randomNumber(1000, 9999) / 10,
    };
    const randomName = 'Channel_' + randomNumber(1000, 9999).toString();
    if (!channelMetadata.find((channel) => channel.systemName === randomName))
      channelMetadata.push(
        generateFullChannelMetadata(
          randomName,
          newChannel.metadata.channel_dtype
        )
      );
    returnedObject = {
      ...returnedObject,
      [randomName]: newChannel,
    };
  }

  return returnedObject;
};

const generateChannelMetadata = (): ChannelMetadata => {
  return generateScalar();
};

const generateScalar = (): ScalarMetadata => {
  return {
    channel_dtype: 'scalar',
    units: 'km',
  };
};

const randomDate = (): Date => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2026, 11, 31);

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
