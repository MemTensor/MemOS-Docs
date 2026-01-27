import { writeFileSync, readFileSync, existsSync } from 'fs'
import fetch from 'node-fetch'

function processReleases(data) {
  return data.map((release) => {
    // Extract what's changed section from body
    const whatsChanged = []
    const bodyLines = release.body.split('\r\n')
    let isInWhatsChanged = false

    for (const line of bodyLines) {
      if (line.includes('What\'s Changed')) {
        isInWhatsChanged = true
        continue
      }
      if (isInWhatsChanged && line.startsWith('* ')) {
        // Parse PR number and url from the line
        const prMatch = line.match(/(https:\/\/github\.com\/MemTensor\/MemOS\/pull\/(\d+))/)
        const prUrl = prMatch ? prMatch[1] : null
        const prNumber = prMatch ? parseInt(prMatch[2]) : null

        // Parse type and description
        const typeMatch = line.match(/\* ([\w()]+):?\s(.+?)\sby\s@/)
        if (typeMatch) {
          const [, type, description] = typeMatch
          whatsChanged.push({
            type: type.toLowerCase(),
            description: description.trim(),
            author: line.match(/@([^\s]+)/)[1],
            pr: prNumber,
            prUrl: prUrl
          })
        }
      }
      // Stop when we hit the next section
      if (isInWhatsChanged && (line.startsWith('## ') || line.startsWith('**Full Changelog**'))) {
        break
      }
    }

    if (release.tag_name === 'v0.1.12') {
      return {
        releaseUrl: release.html_url,
        name: `${release.tag_name}(Pre-release)`,
        date: release.published_at.split('T')[0],
        changedInfo: [{
          type: 'Full Changelog',
          description: 'https://github.com/MemTensor/MemOS/commits/v0.1.12',
          author: 'MemTensor'
        }]
      }
    }

    return {
      releaseUrl: release.html_url,
      name: release.tag_name,
      date: release.published_at.split('T')[0],
      changedInfo: whatsChanged
    }
  })
}

async function fetchReleases() {
  try {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      console.warn('Warning: GITHUB_TOKEN not set. API rate limits may apply.')
    }

    console.log('Fetching releases from MemOS repository...')
    const response = await fetch('https://api.github.com/repos/MemTensor/MemOS/releases', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(token && { Authorization: `token ${token}` })
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch releases: ${response.statusText}`)
    }

    const data = await response.json()
    const processedData = processReleases(data)

    // Create the changelog data file
    const changelogContent = JSON.stringify({
      versions: processedData
    }, null, 2)

    const targetPath = new URL('../content/releases.json', import.meta.url)

    // Check if there are any new versions or changes
    if (existsSync(targetPath)) {
      const existingContent = readFileSync(targetPath, 'utf8')
      const existingContentObj = JSON.parse(existingContent)

      if (existingContentObj.versions[0].name === processedData[0].name) {
        console.log(`current version is ${existingContentObj.versions[0].name}, No new versions or changes detected. Skipping write.`)
        return
      }
    }

    writeFileSync(targetPath, changelogContent)

    console.log('Successfully generated releases data at content/releases.json')
  } catch (error) {
    console.error('Error processing releases:', error)
    process.exit(1)
  }
}

fetchReleases()
