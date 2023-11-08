const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { admin,excludedRoles } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send DM to server Members')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Enter your message')
        .setRequired(true)),
  
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(admin)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }
    
    
    const messageToSend = interaction.options.getString('message');
    const members = await interaction.guild.members.fetch();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    
    await interaction.reply({ content: 'Starting to send DMs...', ephemeral: true });
    
    for (const member of members.values()) {
      if (member.user.bot || member.id === interaction.user.id || member.roles.cache.some(role => excludedRoles.includes(role.id))) continue;

      try {
        await member.send(messageToSend);
        await interaction.editReply({ content: `Message send to ${member.user.tag}` });
        console.log(`Message send to ${member.user.tag}`)
        await delay(3000); // 3-second delay to avoid rate limits
      } catch (error) {
        await interaction.editReply({ content: `Message Could not send to ${member.user.tag}` });
        console.error(`Could not send DM to ${member.user.tag}: ${error}`);
      }
    }
    await interaction.editReply({ content: 'All messages have been sent.' });
  }
};
