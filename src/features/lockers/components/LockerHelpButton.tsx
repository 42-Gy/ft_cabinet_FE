import { useState } from 'react'
import { IconButton, Tooltip } from '@chakra-ui/react'
import { MdHelpOutline } from 'react-icons/md'
import { LockerGuideModal } from '@/features/lockers/components/LockerGuideModal'
import { guideSectionLabels, type GuideSection } from '@/features/lockers/data/lockerGuide'

export const LockerHelpButton = ({ section }: { section: GuideSection }) => {
  const [isOpen, setIsOpen] = useState(false)
  const label = `${guideSectionLabels[section]} 이용안내`
  return (
    <>
      <Tooltip label={label}>
        <IconButton
          aria-label={label}
          icon={<MdHelpOutline size={22} />}
          size="sm"
          minW="44px"
          minH="44px"
          colorScheme="brand"
          variant="ghost"
          borderRadius="full"
          onClick={() => setIsOpen(true)}
        />
      </Tooltip>
      {isOpen && <LockerGuideModal section={section} onClose={() => setIsOpen(false)} />}
    </>
  )
}
