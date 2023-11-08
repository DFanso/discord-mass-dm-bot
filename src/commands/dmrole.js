const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { admin } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dmrole')
    .setDescription('Send DM to members with a specific role')
    .addRoleOption(option => 
      option.setName('targetrole')
            .setDescription('The role of the users you want to send a DM to')
            .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Enter your message')
        .setRequired(true)),
  
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(admin)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }
    
    const targetRole = interaction.options.getRole('targetrole');
    const messageToSend = interaction.options.getString('message');
    const members = await interaction.guild.members.fetch();
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    await interaction.deferReply({ ephemeral: true });
    
    for (const member of members.values()) {
      // Skip bots and the user themselves
      if (member.user.bot || member.id === interaction.user.id) continue;

      // Check if the member has the target role
      if (!member.roles.cache.has(targetRole.id)) continue;

      try {
        await member.send(messageToSend);
        await interaction.editReply({ content: `Message send to ${member.user.tag}` });
        console.log(`Message sent to ${member.user.tag}`);
      } catch (error) {
        await interaction.editReply({ content: `Message Could not send to ${member.user.tag}` });
        console.error(`Could not send DM to ${member.user.tag}: ${error}`);
      }
      await delay(3000); // 3-second delay to avoid rate limits
    }
    
    await interaction.editReply({ content: 'All messages have been sent to the target role members.' });
  }
};
