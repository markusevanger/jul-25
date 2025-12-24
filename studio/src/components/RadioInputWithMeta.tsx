import { Box, Card, Flex, Radio, Stack, Text } from '@sanity/ui'
import { set, unset, PatchEvent, type StringInputProps } from 'sanity'
import { forwardRef, useCallback, useImperativeHandle, useRef, type ComponentType } from 'react'

export type RadioOptionWithMeta = {
  title: string
  value: string
  icon?: ComponentType
  description?: string
}

type SchemaOptions = {
  list?: Array<string | { title: string; value: string }>
  metaOptions?: RadioOptionWithMeta[]
}

export const RadioInputWithMeta = forwardRef<HTMLDivElement, StringInputProps>((props, ref) => {
  const { value, onChange, schemaType, renderDefault } = props
  const options = schemaType.options as SchemaOptions | undefined
  const containerRef = useRef<HTMLDivElement>(null)

  // Expose focus method to parent
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

  const metaOptions = options?.metaOptions
  const listOptions = options?.list

  const handleChange = useCallback(
    (selectedValue: string) => {
      onChange(PatchEvent.from(selectedValue ? set(selectedValue) : unset()))
    },
    [onChange]
  )

  // If no custom options configured, fall back to default rendering
  if (!metaOptions?.length && !listOptions?.length) {
    return renderDefault(props)
  }

  // Render metaOptions with icons/descriptions
  if (metaOptions && metaOptions.length > 0) {
    return (
      <Card padding={3} radius={2} border ref={containerRef}>
        <Stack space={2}>
          {metaOptions.map((option) => {
            const isSelected = value === option.value
            const IconComponent = option.icon

            return (
              <Card
                key={option.value}
                padding={3}
                radius={2}
                shadow={isSelected ? 1 : 0}
                tone={isSelected ? 'primary' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => handleChange(option.value)}
              >
                <Flex align="flex-start" gap={3}>
                  <Box style={{ paddingTop: 2 }}>
                    <Radio checked={isSelected} readOnly />
                  </Box>
                  {IconComponent && (
                    <Box style={{ paddingTop: 2, fontSize: 20 }}>
                      <IconComponent />
                    </Box>
                  )}
                  <Stack space={2} flex={1}>
                    <Text weight="medium">{option.title}</Text>
                    {option.description && (
                      <Text size={1} muted>
                        {option.description}
                      </Text>
                    )}
                  </Stack>
                </Flex>
              </Card>
            )
          })}
        </Stack>
      </Card>
    )
  }

  // Render simple list options
  return (
    <Card padding={3} radius={2} border ref={containerRef}>
      <Stack space={2}>
        {listOptions?.map((option) => {
          const optValue = typeof option === 'string' ? option : option.value
          const optTitle = typeof option === 'string' ? option : option.title || option.value
          const isSelected = value === optValue

          return (
            <Card
              key={optValue}
              padding={3}
              radius={2}
              shadow={isSelected ? 1 : 0}
              tone={isSelected ? 'primary' : 'default'}
              style={{ cursor: 'pointer' }}
              onClick={() => handleChange(optValue)}
            >
              <Flex align="center" gap={3}>
                <Radio checked={isSelected} readOnly />
                <Text weight="medium">{optTitle}</Text>
              </Flex>
            </Card>
          )
        })}
      </Stack>
    </Card>
  )
})
