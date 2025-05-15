import { connect } from 'mongoose';

const config = async(url) => {
    try {
        const connection = await connect(url);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

export default { config };